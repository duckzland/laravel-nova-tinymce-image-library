
import { createClient } from 'pexels';
import Unsplash,  { toJson } from 'unsplash-js';

/**
 * Unifying multiple image providers
 * 
 * Unisplash.com documentation: 
 * https://help.unsplash.com/en/articles/2511271-guideline-hotlinking-images
 * 
 * Pexels.com documentation;
 * https://www.pexels.com/api/documentation/?language=javascript
 * 
 * result json:
 * {
 *   items: [
 *      { id: image_id, src: image_src_url, thumbnail: img_src_thumbs}
 *   ],
 *   page: current page,
 *   maxPage: maximum pagination
 * }
 */
export default class ImageLibs {

    provider = false;
    mustHotLink = ['unsplash'];
    active = 'unsplash';
    cache = {};
    perPage = 20;
    request = false;

    constructor(source, api_key) {
        switch (source) {
            case 'pexels': 
                this.provider = createClient(api_key);
                break;

            case 'unsplash':
                this.provider = new Unsplash({ accessKey: api_key });
                break;
        }
        this.active = source;
        this.cache = {};
    }


    onlyHotlink() {
        return this.mustHotLink.indexOf(this.active) !== -1;
    }


    clear() {
        this.cache = {};
    }



    isPromise(value) {
        return value && value.then && typeof value.then === 'function';
    }


    abortPromise(request, message) {
        if (request && request.reject) {
            request.reject(new Error(message))
        }
        else if (request && request.constructor && request.constructor.reject) {
            request.constructor.reject(new Error(message));
        }
    }


    search(keyword, page, callback) {

        if (this.isPromise(this.request)) {
            this.abortPromise(this.request, 'Fetch request cancelled');
        }

        switch (this.active) {
            case 'unsplash':
                try {
                    this.request = this.provider
                        .search
                        .photos(keyword, page, this.perPage)
                        .then(toJson)
                        .then((images) => {
 
                            callback && callback(this.process(images.results, page, images.total_pages));

                            this.request = false;

                            console.log('[IMAGELIBS] Images searched from unsplash', images);
                        });
                }
                catch(e) {
                    console.log('[IMAGELIBS] Failed to search from unsplash', e);
                }
                break;

            case 'pexels':
                try {
                    this.request = this.provider
                        .photos
                        .search({
                            query: keyword,
                            page: page,
                            per_page: this.perPage
                        })
                        .then((images) => {
                            if (images.error) {
                                throw new Error(images.error);
                            }

                            if (images.code) {
                                throw new Error(images.code);
                            }

                            callback && callback(this.process(images));

                            this.request = false;

                            console.log('[IMAGELIBS] Images searched from pexels', images);
                        });
                }
                catch (e) {
                    console.log('[IMAGELIBS] Failed to search from pexels', e);
                }
                break;
        }
    }


    process(images, defaultPage = '', maxPage = '') {

        let payload = {
            items: [],
            page: defaultPage,
            maxPage: maxPage,
        };

        switch (this.active) {
            case 'unsplash':                
                images.map((photo) => {
                    payload.items.push({
                        id: photo.id,
                        src: photo.urls.full,
                        thumbnail: photo.urls.thumb,
                        name: photo.user.name,
                        link: photo.user.links.html,
                    });
                })
                break;

            case 'pexels':
                payload.page = images.page;
                payload.maxPage = Math.ceil(images.total_results / images.per_page);
                images.photos.map((photo) => {
                    payload.items.push({
                        id: photo.id,
                        src: photo.src.large,
                        thumbnail: photo.src.medium,
                        name: photo.photographer,
                        link: photo.photographer_url,
                    });
                })
                break;

        }
        return payload
    }


    load(page, callback) {

        const result = this.cache[page] || false;

        if (this.isPromise(this.request)) {
            this.abortPromise(this.request, 'Fetch request cancelled');
        }

        if (!result) {
            switch (this.active) {
                case 'unsplash':
                    try {
                        this.request = this.provider
                            .photos
                            .listPhotos(page, this.perPage, 'latest')
                            .then(toJson)
                            .then((images) => {
                                const img = this.process(images, page, 20);
                                callback && callback(img);
                                this.cache[page] = img;

                                console.log('[IMAGELIBS] Images loaded from unsplash', img);
                                this.request = false;
                            });
                    }
                    catch(e) {
                        console.log('[IMAGELIBS] Failed to load from unsplash', e);
                    }
                    break;

                case 'pexels':
                    try {
                        this.request = this.provider
                            .photos
                            .curated({
                                page: page,
                                per_page: this.perPage
                            })
                            .then((images) => {

                                if (images.error) {
                                    throw new Error(images.error);
                                }

                                if (images.code) {
                                    throw new Error(images.code);
                                }

                                const img = this.process(images);
                                callback && callback(img);

                                this.cache[page] = img;

                                this.request = false;

                                console.log('[IMAGELIBS] Images loaded from pexels', img);
                            });
                    }
                    catch (e) {
                        console.log('[IMAGELIBS] Failed to load from pexels', e);
                    }
                    break;
            }
        }
        else {
            callback && callback(result);
        }
    }


    callDownload(id) {
        switch (this.active) {
            case 'unsplash':
                this.provider.photos.getPhoto(id)
                    .then(toJson)
                    .then(json => {
                        this.provider.photos.downloadPhoto(json);
                    });
                break;
        }
    }
}