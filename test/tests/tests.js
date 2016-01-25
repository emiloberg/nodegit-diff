import path from 'path';
import fs from 'fs-extra';
import nodegit from 'nodegit';
import test from 'ava';
import 'babel-core/register';

import setupRepo from '../helpers/setupRepo';
import diffToJson from '../helpers/diffToJson';

import gitDiff from '../../src/index'

const repoDir = path.resolve(__dirname, '../repos');

test.afterEach(() => {
	fs.removeSync(repoDir);
});

test('Get diff from 1 SHA', t => {
	t.plan(1);
	const expected = require('../fixtures/actual.test1Sha.json');
	return setupRepo()
	.then((commits) => {
		return nodegit.Repository.open(repoDir)
		.then(repo => (gitDiff({ repo, sha: commits[3] })))
		.then(diffToJson)
		.then(actual => { t.same(actual, expected); })
	})
});

test('Get diff from 2 SHAs', t => {
	t.plan(1);
	const expected = require('../fixtures/actual.test2Shas.json');
	return setupRepo()
	.then((commits) => {
		return nodegit.Repository.open(repoDir)
		.then(repo => (gitDiff({ repo, sha: commits[2], sha2: commits[0] })))
		.then(diffToJson)
		.then(actual => { t.same(actual, expected); })
	})
});

test.cb('Throw if not correct parameters', t => {
	t.plan(2);
	setupRepo()
	.then(() => {
		nodegit.Repository.open(repoDir)
		.then(() => {
			t.throws(() => {
				gitDiff();
			});

			t.throws(() => {
				gitDiff({ repo });
			});
			t.end();
		})
	})
});
