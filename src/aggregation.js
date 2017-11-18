const mongoose = require('mongoose');
const config = require('../config');

const { Schema } = mongoose;
const { Types } = Schema;

mongoose.Promise = global.Promise;
mongoose.connect(config.get('mongo').uri);

const collectionSchema = Schema({
  link: String,
  fullname: String,
  createdat: Date,
  projects: [{
    type: Types.ObjectId,
    ref: 'Projects',
  }],
});

const projectSchema = Schema({
  link: String,
  isbroken: Boolean,
  fullname: String,
  lastscraped: Date,
  createdat: Date,
  analytics: [{ type: Types.Mixed }],
});

const detailedCollectionSchema = Schema({
  collectionId: { type: Types.ObjectId },
  countOfProjects: Number,
  sumOfStars: Number,
  createdAt: Date,
  updatedAt: Date,
  lastProjectCreatedAtOnGithub: Date,
  lastProjectUpdatedAtOnGithub: Date,
  projects: [{
    type: Types.ObjectId,
    ref: 'DetailedProject',
  }],
  contributors: [{
    type: Types.ObjectId,
    ref: 'Contributor',
  }],
  latestUpdatedProjects: [{
    type: Types.ObjectId,
    ref: 'DetailedProject',
  }],
  mostStarredProjects: [{
    type: Types.ObjectId,
    ref: 'DetailedProject',
  }],
  topContributors: [{
    type: Types.ObjectId,
    ref: 'Contributor',
  }],
});

const detailedProjectSchema = Schema({
  projectId: { type: Types.ObjectId },
  createdAt: Date,
  updatedAt: Date,
  stars: Number,
  forks: Number,
  language: String,
  languages: [{
    name: String,
    bytes: Number,
  }],
  desc: String,
  createdAtOnGithub: Date,
  updatedAtOnGithub: Date,
  contributors: [{
    type: Types.ObjectId,
    ref: 'Contributor',
  }],
});

const contributorSchema = Schema({
  login: String,
  githubId: Number,
  avatar: String,
  contributions: Number,
});

const CollectionModel = mongoose.model('Awesomes', collectionSchema);
const ProjectModel = mongoose.model('Projects', projectSchema);
const DetailedCollectionModel = mongoose.model('DetailedCollection', detailedCollectionSchema);
const DetailedProjectModel = mongoose.model('DetailedProject', detailedProjectSchema);
const ContributorModel = mongoose.model('Contributor', contributorSchema);

const procColl = async (coll) => {
  const { projects } = coll;

  const hasAnalitics = projects
    .filter(proj => proj.analytics.length);

  const saveContributors = (async () => {
    const saveContributor = async ({ githubId, ...contrib }) =>
      ContributorModel.update(
        { githubId },
        { $set: { contrib } },
        { upsert: true },
      ).exec();

    const tasks = hasAnalitics
      .map(proj => proj.analytics[0].contributors)
      .map(cont => ({
        githubId: cont.id,
        avatar: cont.avatar,
        login: cont.login,
        contributions: cont.contributions,
      }))
      .map(saveContributor);

    return Promise.all(tasks);
  })();

  const detailedProjects = (async () => {
    const contributors = await saveContributors();

    const tasks = hasAnalitics
      .map((proj) => {
        const { analytics, _id } = proj;
        const {
          languages,
          repository,
        } = analytics[0];

        return {
          projectId: _id,
          stars: repository.stargazerscount,
          forks: repository.forkscount,
          desc: repository.description,
          language: repository.language,
          createdAtOnGithub: repository.createdat.time,
          updatedAtOnGithub: repository.updatedat.time,
          languages: Object.keys(languages).map(lang => ({ name: lang, bytes: languages[lang] })),
        };
      });
  })();
};

module.exports = async () => {
  const collc = CollectionModel.find()
    .sort({ createdat: -1 })
    .populate('projects')
    .cursor();

  let coll = await collc.next();
  while (coll != null) {
    await procColl(coll); // eslint-disable-line
    coll = await collc.next(); // eslint-disable-line
  }
};
