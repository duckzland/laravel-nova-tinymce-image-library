import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import InfiniteScroll from 'react-infinite-scroller';
import { Input, List, Spin } from 'antd';
import parse from 'html-react-parser';

import ImageLibrary from './ImageLibs';

export default class LibraryFile extends React.PureComponent {


    library = null;
    editor = null;
    api = null;
    source = null;
    labels = {};

    state = {
        search: null,
        page: 0,
        loading: true,
        searching: false,
        maxPage: false,
        searchText: '',
        images: {},
        active: null,
        data: {},
        hasMore: true,
        source: false,
        api: false
    }

    searchTimer = -1;

    

    constructor(props) {
        super(props);

        this.editor = props.editor;
        this.labels = props.labels;
        this.api = props.api;
        this.source = props.source;
        this.library = new ImageLibrary(this.source, this.api);
    }


    componentDidMount() {
        this.handleLoad();
    }


    fetchCallback = (res) => {

        let { data } = this.state;
        let i = Object.keys(data).length;


        res.items.map((d) => {
            if (!data[d.id]) {
                d.order = i;
                data[d.id] = d;
                i++;
            }
        });

        this.setState({
            data: data,
            loading: false,
            maxPage: res.maxPage,
            page: res.page,
            hasMore: res.page !== res.maxPage
        });
    }


    handleChoose = (imgId, imgUrl) => {
        this.editor.value = imgUrl;

        this.setState({
            active: imgId
        });
    }



    handleLoad = () => {

        const { page, maxPage, searchText } = this.state;


        if (page === maxPage) {
            return;
        }

        let targetPage = page + 1;

        this.setState({
            loading: true,
            page: targetPage
        })

        if (searchText !== '') {
            this.library.search(searchText, targetPage, this.fetchCallback );
        }
        else {
            this.library.load(targetPage, this.fetchCallback );
        }
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
        }, 300);
    }


    renderListItem = (item, key) => {
        const c = [ 'images' ];
        const { active } = this.state;
        const { handleChoose, source, labels } = this;

        if (active === item.id) {
            c.push('active');
        }
        
        return (
            <List.Item key={ key }>
                <div className={ c.join(' ') } onClick={ () => handleChoose(item.id, item.src) }>
                    <LazyLoadImage 
                        key={ item.url } 
                        src={ item.thumbnail } 
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
                    { (source === 'unsplash' && item.name && item.link) &&
                        <div className="attribution">
                            { 
                                parse(labels.attributionText
                                    .replace('%{author}', '<a class="author" href="' + item.link + '?utm_source=vincere&utm_medium=referral" target="_blank">' + item.name + '</a>')
                                    .replace('%{source}', '<a href="https://unsplash.com/?utm_source=vincere&utm_medium=referral" target="_blank">Unsplash</a>')
                                ) 
                            }
                        </div>
                    }
                    { (source === 'pexels' && item.name && item.link) &&
                        <div className="attribution">
                            { 
                                parse(labels.attributionText
                                    .replace('%{author}', '<a class="author" href="' + item.link + '" target="_blank">' + item.name + '</a>')
                                    .replace('%{source}', '<a href="https://pexels.com" target="_blank">Pexels</a>')
                                )
                            }
                        </div>
                    }
                </div>
            </List.Item>
        )
    }


    render() {
        const { renderListItem, handleLoad, handleSearch } = this;
        const { data = {}, loading, searching, hasMore, searchText } = this.state;
        const orderedData = Object.values(data).sort((a, b) => a.order > b.order ? true : false);

        const cName = ['tiny-imagelibs'];
        if (loading) {
            cName.push('loading');
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