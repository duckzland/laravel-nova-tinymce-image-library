import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import InfiniteScroll from 'react-infinite-scroller';
import { message, Button, Input, Upload, List, Spin } from 'antd';
import FileUploader from './FileUploader';


export default class LocalFile extends React.PureComponent {


    editor = null;
    token = null;
    urls = {};
    labels = {};

    state = {
        search: null,
        page: 0,
        loading: true,
        searching: false,
        uploading: false,
        maxPage: false,
        searchText: '',
        images: {},
        active: null,
        data: {},
        hasMore: true,
        deleting: []
    }

    searchTimer = -1;

    

    constructor(props) {
        super(props);

        this.editor = props.editor;
        this.token = props.token;
        this.urls = props.urls;
        this.labels = props.labels;
        this.uploads = props.uploads;
    }



    componentDidMount() {
        this.handleLoad();

        message.config({
            getContainer: () => document.querySelector('.tinymce-imagelibrary-dialog .content-box')
        });
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


    upload(url, file, options = {}, complete = false, error = false, validation = false, chunk = false) {

        const o = Object.assign({}, {
            url: url,
            token: this.token,
        }, options);

        const f = new FileUploader(file, o, complete, error, validation, chunk);

        return f.upload();
    }


    handleChoose = (imgId, imgUrl) => {
        this.editor.value = imgUrl;

        this.setState({
            active: imgId
        });
    }


    handleLoad = () => {

        const { page, maxPage, searchText } = this.state;

        if (!this.urls.load) {
            return;
        }

        if (page === maxPage) {
            return;
        }

        let targetPage = page + 1;

        this.setState({
            loading: true,
            page: targetPage
        })

        const payload = {
            page: targetPage
        }

        if (searchText !== '') {
            payload.search_text = searchText;
        }

        this.fetch(
            this.urls.load, 
            payload, 
            (res) => {
       
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
                    searching: false,
                    page: current_page,
                    maxPage: last_page,
                    data: data,
                    hasMore: current_page !== last_page
                });
            },
            (res) => {
                res.message && message.error(res.message);

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
    }


    handleDelete = (mediaId) => {
        if (!this.urls.delete) {
            return;
        }

        const { deleting = [] } = this.state;

        deleting.push(mediaId);

        this.setState({
            deleting: deleting
        });

        this.forceUpdate();

        this.fetch(
            this.urls.delete, 
            { media_id: mediaId }, 
            (res) => {

                const { data } = this.state;
                
                if (data[mediaId]) {
                    delete data[mediaId];
                }

                this.setState({
                    data: Object.assign({}, data),
                    deleting: deleting.filter((x) => x !== mediaId)
                })

                res.message && message.error(res.message);

            },
            (res) => {
                res.message && message.error(res.message);
            },
            (res) => {
                console.log(res);
            }
        )
    }


    handleSearch = (e) => {
        const { value = '' } = e.target || {};

        this.setState({
            loading: true,
            searchText: value,
            searching: true,
            page: 0,
            maxPage: false,
            data: {}
        });

        this.searchTimer && clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
            this.handleLoad();
        }, 100);
    }


    handleUpload = (file, context) => {

        if (!this.urls.upload) {
            return false;
        }

        this.setState({
            uploading: true,
        });

        this.upload(
            this.urls.upload,
            file, 
            {
                filesize: parseInt(this.uploads.max_size, 10) || 2 * 1024 * 1024, // 2MB
                chunksize: parseInt(this.uploads.chunk_size, 10) || 1024 * 1024,
                allowed: this.uploads.allowed || 'image/jpeg,image/gif,image/png,image/jpg',
            },

            // Complete
            (res) => {
                if (res.status === 'OK') {
                    message.info(res.message);

                    const { data = {} } = this.state;
                    const { media_id, url } = res;
    
                    data[media_id] = {
                        id: media_id,
                        url: url,
                        order: -1
                    }
    
                    let i = Object.keys(data).length;
                    const d = Object.values(data);
    
                    d.sort((a, b) => a.order > b.order ? true : false)
                        .map((d) => {
                            d.order = i;
                            data[d.id] = d;
                            i++;
                        });
    
                    this.setState({
                        uploading: false,
                        data: data
                    });

                }
                else {
                    message.error(res.message);
                        
                    this.setState({
                        uploading: false
                    });
                }
            },

            // Error
            (e) => {
                message.error(this.labels.uploadError || 'Failed to upload');
                this.setState({
                    uploading: false,
                });
            },

            // Validation
            (e) => {
                if (e.status) {
                    switch (e.status) {
                        case '011_FILE_TYPE_NOT_ALLOWED':
                            message.error(this.labels.uploadNotAllowed || 'File type not allowed');
                            break;

                        case '012_FILE_SIZE_EXCEEDED_MAXIMUM':
                            message.error(this.labels.uploadTooLarge || 'File size too large');
                            break;
                    }
                }
                this.setState({
                    uploading: false,
                });
            }
        )


        // This is needed to stop antd to process upload using their logic.
        return false;
    }


    renderListItem = (item, key) => {
        const c = [ 'images' ];
        const { active, deleting = [] } = this.state;
        const { handleChoose, handleDelete } = this;

        let deleteMode = false;
        if (active === item.id) {
            c.push('active');
        }

        if (deleting.includes(item.id)) {
            c.push('deleting');
            deleteMode = true;
        }
        
        return (
            <List.Item key={ key }>
                <div className={ c.join(' ') } onClick={ () => handleChoose(item.id, item.url) }>
                    <LazyLoadImage 
                        key={ item.url } 
                        src={ item.url } 
                        effect="blur" />
                    <div className="image-placeholder">                  
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480">
                        <path d="M440,72H40c-22.08,0.026-39.974,17.92-40,40v256c0.026,22.08,17.92,39.974,40,40h400
                            c2.245,0.009,4.486-0.187,6.696-0.584C465.945,404.194,480.037,387.517,480,368V112C479.974,89.919,462.08,72.026,440,72z
                            M40,392c-12.435-0.002-22.81-9.501-23.904-21.888L175.6,265.824L337.808,392H40z M464,368
                            c0.013,11.742-8.492,21.761-20.08,23.656c-1.294,0.233-2.606,0.348-3.92,0.344h-76.136l-105.992-82.488l94.784-75.792
                            L464,300.528V368z M464,281.872l-107.88-64.728c-2.868-1.725-6.506-1.482-9.12,0.608l-102.136,81.68l-63.96-49.744
                            c-2.695-2.094-6.421-2.249-9.28-0.384L16,351.056V112c0-13.255,10.745-24,24-24h400c13.255,0,24,10.745,24,24V281.872z"/>
                        <path d="M240,120c-26.51,0-48,21.49-48,48c0.026,26.499,21.501,47.974,48,48c26.51,0,48-21.49,48-48
                            C288,141.49,266.51,120,240,120z M240,200c-17.673,0-32-14.327-32-32s14.327-32,32-32c17.673,0,32,14.327,32,32
                            S257.673,200,240,200z"/>
                        </svg>
                    </div>
                    { deleteMode && <div className="image-spinner"><Spin /></div> }
                </div>
                { !deleteMode && 
                <div className="remove" onClick={ () => handleDelete(item.id) }>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                        <line x1="15" y1="15" x2="25" y2="25" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeMiterlimit="10"></line>
                        <line x1="25" y1="15" x2="15" y2="25" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeMiterlimit="10"></line>    
                    </svg>
                </div> }
            </List.Item>
        )
    }


    render() {
        const { renderListItem, handleLoad, handleSearch, handleUpload } = this;
        const { data = {}, loading, searching, uploading, hasMore, searchText } = this.state;
        const orderedData = Object.values(data).sort((a, b) => a.order > b.order ? true : false);

        const cName = ['tiny-imagelibs'];
        if (loading) {
            cName.push('loading');
        }

        if (uploading) {
            cName.push('uploading');
        }

        if (searching) {
            cName.push('searching');
        }

        return (
            <div className={ cName.join(' ') }>
                <div className="top-box">
                    <div className="image-search">
                        <Input.Search 
                            type="text" 
                            size="large" 
                            value={ searchText } 
                            placeholder={ this.labels.searchPlaceholder || '' } 
                            loading={ searching && loading } 
                            enterButton={ this.labels.searchText || '' } 
                            onChange={ handleSearch } />
                    </div>
                    <div className="image-upload">
                        <Upload 
                            showUploadList={ false } 
                            beforeUpload={ handleUpload } 
                            accept={ this.uploads.allowed || '.jpg,.jpeg,.png,image/jpeg,image/png,image/jpg' } 
                            loading={ uploading }
                            disabled={ uploading }>
                            <Button size="large" disabled={ uploading }>
                                { (uploading ? this.labels.uploadingText : this.labels.uploadText) || '' }
                            </Button>
                        </Upload>
                    </div>
                </div>
                <div className="content-box">
                    <InfiniteScroll 
                        initialLoad={ false } 
                        pageStart={ 0 } 
                        loadMore={ handleLoad } 
                        hasMore={ !loading && hasMore } 
                        useWindow={ false } 
                        loading={ +loading }>
                        <List 
                            grid={{ gutter: 20, column: 4 }} 
                            rowKey={ (record) => record.id } 
                            dataSource={ orderedData } 
                            split={ false } 
                            itemLayout="vertical" 
                            renderItem={ renderListItem }>
                            { loading && hasMore && 
                            <div className="loading-container">
                                <Spin />
                            </div> }
                        </List>
                    </InfiniteScroll>
                </div>
            </div>
        )
    }
}