


export default class FileUploader {

    constructor(file, options, complete = false, error = false, validation = false, chunk = false) {

        this.options = options;
        this.file = file;

        this.onValidationError = validation;
        this.onError = error;
        this.onChunkComplete = chunk;
        this.onComplete = complete;
    }



    upload() {

        const { file, options } = this;

        if (options.allowed && options.allowed.indexOf(file.type) === -1) {
            this.onValidationError && this.onValidationError({ 
                status: '011_FILE_TYPE_NOT_ALLOWED' 
            });
            return;
        }

        if (options.filesize && file.size > options.filesize) {
            this.onValidationError && this.onValidationError({ 
                status: '012_FILE_SIZE_EXCEEDED_MAXIMUM' 
            });
            return;
        }

        this.queues = [];
        this.totalchunks = Math.ceil(file.size / options.chunksize);

        for (let i=0; i < this.totalchunks; i++) {
            this.queues.push(() => {
                const start = i * options.chunksize;
                const end = start + options.chunksize;

                fetch(options.url, {
                    method: 'POST',
                    mode: 'same-origin',
                    credentials: 'same-origin',
                    headers: {
                        'X-CSRF-TOKEN': options.token,
                        'X-File-Name': file.name,
                        'X-File-Type': file.type,
                        'X-File-Size': file.size,
                        'X-Chunks': this.totalchunks,
                        'X-Chunk': i
                    },
                    body: file.slice(start, end > file.size ? file.size : end)
                })
                .then(res => res.json())
                .then((json) => {
                    const nextQueue = this.queues.shift();

                    if (nextQueue) {
                        this.onChunckComplete && this.onChunkComplete(this.totalchunks, i, json);
                        nextQueue();
                    }
                    else {
                        this.onComplete && this.onComplete(json);
                    }
                })
                .catch((e) => {
                    this.onError && this.onError(e)
                });
            });
        }

        const nextQueue = this.queues.shift();
        nextQueue && nextQueue();
    }
}