import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import InfiniteScroll from 'react-infinite-scroller';
import { Upload, List, Spin } from 'antd';


import '../../node_modules/react-lazy-load-image-component/src/effects/blur.css';

import FileUploader from './FileUploader';


export default class Manager extends React.PureComponent {


    editor = null;
    token = null;
    urls = {};
    labels = {};

    state = {
        search: null,
        page: 0,
        loading: false,
        maxPage: false,
        searchText: '',
        images: {},
        active: null,
        data: {},
        hasMore: true,
    }


    constructor(props) {
        super(props);

        this.editor = props.editor;
        this.token = props.token;
        this.urls = props.urls;
        this.labels = props.labels;
        this.uploads = props.uploads;

        this.handleLoad();

    }


    fetch(url, payload = {}, success = false, error = false, complete = false) {

        const controller = new AbortController();
        const signal = controller.signal;

        fetch(url, Object.assign({
            method: 'POST',
            mode: 'same-origin',
            credentials: 'same-origin',
            headers: {
                'X-CSRF-TOKEN': this.token,
                'Cache-Control': 'no-store',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                'Accept': 'application/json, text-plain, */*',
            }
        }, {
            signal: signal,
            body: JSON.stringify(payload)
        }))
        .then(res => {
            return res.ok ? res.json() : res;
        })
        .then(res => {
            const { status } = res;

            if (status === 'OK') {
                success && success(res);
            }
            else {
                error && error(res);
            }
        })
        .catch(e => console.log('[ERROR]', e))
        .then(() => { complete && complete() });

        return controller;
    }


    upload(url, file, options = {}, complete = false,  error = false, validation = false, chunk = false) {
        const f = new FileUploader(file, Object.assign({}, {
            url: url,
            onValidationError: (error) => {
                console.log(error)
                validation && validation(error);
            },
            onError: (e) => {
                error && error(e);
                console.log(e);
            },
            onChunkComplete: (varChunks, varChunk, json) => {
                chunk && chunk(varChunks, varChunk, json);
            },
            onComplete: (json) => {
                complete && complete(json);
            }
        }, options));

        return f.upload();
    }


    handleChoose = (imgId, imgUrl) => {
        this.editor.value = imgUrl;

        this.setState({
            active: imgId
        });
    }


    handleLoad = (search = '') => {
        const { page, maxPage, searchText } = this.state;

        if (!this.urls.load) {
            return;
        }

        if (page === maxPage) {
            return;
        }

        let targetPage = page;

        if (searchText !== search) {
            targetPage = 0;
        }

        this.setState({
            loading: true,
            searchText: search,
            page: targetPage
        })

        this.fetch(
            this.urls.load, 
            { page: targetPage }, 
            (res) => {
                console.log(res);
                const { current_page, last_page } = res;
                const { data = {} } = this.state;

                let i = Object.keys(data).length;
                res.data.map((d) => {
                    if (!data[d.id]) {
                        d.order = i;
                        data[d.id] = d;
                        i++;
                    }
                });

                this.setState({
                    loading: false,
                    page: current_page === last_page ? current_page : current_page + 1,
                    maxPage: last_page,
                    data: data,
                    hasMore: current_page !== last_page
                });
            },
            (res) => {
                this.setState({
                    loading: false,
                });
            },
            (res) => {
                this.setState({
                    loading: false,
                });

            }
        )
    };



    handleDelete = (mediaId) => {
        if (!this.urls.delete) {
            return;
        }

        this.fetch(
            this.urls.delete, 
            { media_id: mediaId }, 
            (res) => {

                const { data } = this.state;
                
                if (data[mediaId]) {
                    delete data[mediaId];
                }

                this.setState({
                    data: Object.assign({}, data)
                })
                console.log(res);
            },
            (res) => {
                console.log(res);
            },
            (res) => {
                console.log(res);
            }
        )
    }



    handleUpload = (file, context) => {

        if (!this.urls.uploads) {
            return;
        }

        this.upload(
            file, 
            {
                filesize: this.uploads.max_size || 2 * 1024 * 1024, // 2MB
                chunksize: this.uploads.chunk_size || 1024 * 1024,
                allowed: this.uploads.allowed.split(',') || ['image/jpeg', 'image/gif', 'image/png', 'image/jpg'],
            },

            // Complete
            (json) => {
                console.log(json)
            },

            // Error
            (e) => {
                console.log(e)
            },

            // Validation
            (e) => {
                console.log(e);
            }
        )

        // This is needed to stop antd to process upload using their logic.
        return false;
    }





    renderListItem = (item, key) => {
        const c = [ 'images' ];
        const { active } = this.state;
        const { handleChoose, handleDelete } = this;

        if (active === item.id) {
            c.push('active');
        }
        
        return (
            <List.Item key={ key }>
                <div className={ c.join(' ') } onClick={ () => handleChoose(item.id, item.url) }>
                    <LazyLoadImage key={ item.url } src={ item.url } effect="blur" />
                </div>
                <div className="remove" onClick={ () => handleDelete(item.id) }>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                        <line x1="15" y1="15" x2="25" y2="25" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeMiterlimit="10"></line>
                        <line x1="25" y1="15" x2="15" y2="25" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeMiterlimit="10"></line>    
                    </svg>
                </div>
            </List.Item>
        )
    }




    render() {
        const { renderListItem, handleLoad } = this;
        const { data = {}, loading, hasMore } = this.state;
        const orderedData = Object.values(data).sort((a, b) => a.order > b.order ? true : false);

        return (
            <div className="tiny-imagelibs">
                <div className="top-box">

                </div>
                <div className="content-box">
                    <InfiniteScroll initialLoad={ false } pageStart={ 0 } loadMore={ handleLoad } hasMore={ !loading && hasMore } useWindow={ false }>
                        <List grid={{ gutter: 20, column: 4 }} rowKey={ (record) => record.id } dataSource={ orderedData } split={ false } itemLayout="vertical" renderItem={ renderListItem }>
                            { loading && hasMore && <Spin /> }
                        </List>
                    </InfiniteScroll>
                </div>
            </div>
        )
    }
}