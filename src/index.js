function getTree({ repo, sha }) {
	return repo.getCommit(sha)
	.then(commit => (commit.getTree()));
}

function patchToMetaAndHunks(patch) {
	return patch.hunks()
	.then(hunks => ({
		meta: patch,
		hunks: hunks
	}));
}

function fileToFileWithLines(file) {
	return Promise.all(file.hunks.map(hunk => hunk.lines()))
	.then(chunks => ({
		meta: file.meta,
		chunks: chunks
	}));
}

function diffToDiffObj(diff) {
    return diff.patches()
	.then(patches => Promise.all(patches.map(patchToMetaAndHunks)))
	.then(metaAndHunks => Promise.all(metaAndHunks.map(fileToFileWithLines)));
}

export default function getDiff({ repo, sha, sha2 } = { repo, sha, sha2 }) {
    if (sha && sha2) {
		return Promise.all([getTree({ repo, sha }), getTree({ repo, sha: sha2 })])
		.then(diffTrees => diffTrees[0].diff(diffTrees[1]))
		.then(diffToDiffObj);
    } else if (sha) {
		return repo.getCommit(sha)
		.then(commit => commit.getDiff())
		.then(diffList => Promise.all(diffList.map(diff => diffToDiffObj(diff))))
		.then(diffObjs => diffObjs.reduce((a, b) => a.concat(b), []))
	} else {
		throw new Error("An object with 'repo' and 'sha' properties must be supplied");
	}
}
