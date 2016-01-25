export default function diffToJson(files) {
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
