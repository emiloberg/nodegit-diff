import path from 'path';
import fs from 'fs-extra';
import nodegit from 'nodegit';
import test from 'ava';

import gitDiff from '../../dist/index'

const fixturesDir = path.resolve(__dirname, '../fixtures');
const repoDir = path.resolve(__dirname, '../repos');

function doCommit({ repository, files, message, createRepo = false }) {
	let index;
	let oid;

	return Promise.resolve()
	.then(() => {
		files.forEach(file => {
			fs.writeFileSync(path.join(repository.workdir(), file.name), file.content);
		});
	})
	.then(() => (repository.openIndex()))
	.then(idx => {
		index = idx;
		return index.read(1);
	})
	.then(() => {
		files.forEach(file => {
			index.addByPath(file.name);
		});
	})
	.then(() => index.write())
	.then(() => index.writeTree())
	.then(oidResult => {
		oid = oidResult;
		if (createRepo) { return; }
		return nodegit.Reference.nameToId(repository, 'HEAD');
	})
	.then(head => {
		if (createRepo) { return; }
		return repository.getCommit(head);
	})
	.then(parent => {
		const par = parent ? [parent] : [];
		var author = nodegit.Signature.create('Emil Öberg', 'emil.oberg@gmail.com', 123456789, 60);
		var committer = nodegit.Signature.create('Emil Öberg', 'emil.oberg@gmail.com', 987654321, 90);
		return repository.createCommit('HEAD', author, committer, message, oid, par);
	})
	.then(commitId => {
		return {
			repository,
			commit: commitId.tostrS()
		}
	});
}

function setupRepo() {
	fs.emptyDirSync(repoDir);
	const commits = [];
	return nodegit.Repository.init(repoDir, 0)
	.then((repository) => (
		doCommit({
			createRepo: true,
			repository,
			message: 'Init commit',
			files: [
				{
					name: 'fileA.txt',
					content: fs.readFileSync(path.resolve(fixturesDir, '1/fileA.txt'), { encoding: 'utf-8' })
				}, {
					name: 'fileB.txt',
					content: fs.readFileSync(path.resolve(fixturesDir, '1/fileB.txt'), { encoding: 'utf-8' })
				}
			]
		})
	))
	.then(({ repository, commit }) => {
		commits.push(commit);
		return doCommit({
			repository,
			message: 'Second commit',
			files: [{
				name: 'fileA.txt',
				content: fs.readFileSync(path.resolve(fixturesDir, '2/fileA.txt'), {encoding: 'utf-8'})
			}]
		})
	})
	.then(({ repository, commit }) => {
		commits.push(commit);
		return doCommit({
			repository,
			message: 'Third commit',
			files: [{
				name: 'fileA.txt',
				content: fs.readFileSync(path.resolve(fixturesDir, '3/fileA.txt'), { encoding: 'utf-8' })
			}, {
				name: 'fileB.txt',
				content: fs.readFileSync(path.resolve(fixturesDir, '3/fileB.txt'), { encoding: 'utf-8' })
			}]
		})
	})
	.then(({ repository, commit }) => {
		commits.push(commit);
		return doCommit({
			repository,
			message: 'Fourth commit',
			files: [{
				name: 'fileC.txt',
				content: fs.readFileSync(path.resolve(fixturesDir, '4/fileC.txt'), { encoding: 'utf-8' })
			}]
		})
	})
	.then(({ commit }) => {
		commits.push(commit);
	})
	.then(() => commits)
}

function diffToJson(files) {
	return files.map(file => ({
			isAdded: file.meta.isAdded(),
			filename: file.meta.newFile().path(),
			chunks: file.chunks.map((chunk) => {
				return chunk.map(line => {
					return {
						oldLineno : line.oldLineno(),
						newLineno: line.newLineno(),
						origin: String.fromCharCode(line.origin()),
						content: line.content().replace(/\s+$/g, '')
					}
				})
			})
	}));
}

test.afterEach(() => {
	fs.removeSync(repoDir);
});

test('Get diff from 1 SHA', t => {
	t.plan(1);
	const expected = require('../fixtures/actual.test1Sha.json');

	return setupRepo()
	.then((commits) => {
		return nodegit.Repository.open(repoDir)
		.then(repo => {
			return gitDiff({
				repo,
				sha: commits[3]
			})
		})
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
		.then(repo => {
			return gitDiff({
				repo,
				sha: commits[2],
				sha2: commits[0]
			})
		})
		.then(diffToJson)
		.then(actual => { t.same(actual, expected); })
	})
});
