import path from 'path';
import fs from 'fs-extra';
import nodegit from 'nodegit';

export default function doCommit({ repository, files, message, createRepo = false }) {
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
