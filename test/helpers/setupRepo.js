import path from 'path';
import fs from 'fs-extra';
import nodegit from 'nodegit';

import doCommit from './doCommit';

const fixturesDir = path.resolve(__dirname, '../fixtures');
const repoDir = path.resolve(__dirname, '../repos');

export default function setupRepo() {
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
