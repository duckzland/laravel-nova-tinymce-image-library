


export default class FileUploader {

    constructor(file, options) {
        this.options = options;
        this.file = file;
    }



    upload() {

        const { file, options } = this;

        if (options.allowed && !options.allowed.indexOf(file.type) === -1) {
            options.onValidationError && options.onValidationError({ 
                status: '011_FILE_TYPE_NOT_ALLOWED' 
            });
            return;
        }

        if (options.filesize && file.size > options.filesize) {
            options.onValidationError && options.onValidationError({ 
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
                    headers: {
                        'X-CSRF-TOKEN': Api.token,
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
                        options.onChunkComplete(this.totalchunks, i, json);
                        nextQueue();
                    }
                    else {
                        options.onComplete(json);
                    }
                })
                .catch((e) => {
                    options.onError && options.onError(e)
                });
            });
        }

        const nextQueue = this.queues.shift();
        nextQueue && nextQueue();

    }
}