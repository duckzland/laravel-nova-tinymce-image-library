import React from 'react';
import { Button, Modal, List } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import Api from 'api/index';
import Language from 'modules/Language';
import Loader from 'loaders/preloading';

import { omitBy, cloneDeep } from 'lodash';

import 'node_modules/react-lazy-load-image-component/src/effects/blur.css';


export default class ImageLocal extends React.PureComponent {

    state = {
        visible: false,
        provider: 'engage',
        search: '',
        loading: true,
        modalLoading: false,
        hasMore: true,
        page: 1,
        maxPage: false,
        data: {},
        active: [],
        src: []
    }


    constructor(props) {
        super(props);
        this.state.visible = props.visible;
        this.state.hasMore = true;
        this.state.maxPage = 5;
        this.state.page = 1;
        this.state.active = props.value || props.active || [];
    }


    fetchCallback = (res) => {
        let { data } = this.state;
        let i = Object.keys(data).length;

        if (res.provider !== 'engage') {
            return;
        }

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


    handleClose = () => {
        this.setState({
            visible: false,
        });
    }

    handleOpen = () => {
        const { page } = this.state;
        Api.imageLibs.load(page, this.fetchCallback, 'engage');
        this.setState({
            visible: true,
            modalLoading: false,
        })
    }


    handleChoose = (id, src) => {
        const { multiple } = this.props;
        const index = this.state.active.indexOf(id);
        const indexSrc = this.state.src.indexOf(src);
        const active = cloneDeep(this.state.active);
        const sources = cloneDeep(this.state.src);

        if (multiple) {
            if (index !== -1) {
                active.splice(index, 1);
                sources.splice(indexSrc, 1);
            }
            else {
                active.push(id);
                sources.push(src);
            }

            this.setState({
                active: active,
                src:  sources,
            });

        }
        else {
            this.setState({
                active: index !== -1 ? [] : [ id ],
                src:  index !== -1 ? [] : [ src ],
            });
        }
    } 
    

    handleSubmit = () => {
        const { onChange, name } = this.props;
        const { src } = this.state;

        if (src.length === 0) {
            this.handleClose();
            return;
        }

        let queues = cloneDeep(src);

        this.setState({
            modalLoading: true
        });

        src.map((s) => {
            queues.pop();
            onChange && onChange({
                target: {
                    name: name,
                    value: s,
                }
            });

            if (queues.length === 0) {
                this.handleClose();
            }
        });
    }


    handleDelete = (id, src) => {
        const { onDelete } = this.props;
        const activeIndex = this.state.active.indexOf(id);
        const sourceIndex = this.state.src.indexOf(src);
        const active = cloneDeep(this.state.active);
        const sources = cloneDeep(this.state.src);

        active.splice(activeIndex, 1);
        sources.splice(sourceIndex, 1);

        Api.media.delete(
            src, 
            (res) => {
                Api.panel.notify(Language.t('File removed successfully'));
                Api.imageLibs.clear('engage');
            },
            (res) => {
                Api.panel.notify(Language.t('Failed removing file'));
            }
        );

        this.setState({
            active: active,
            src: sources,
            data: omitBy(this.state.data, (d) => {
                return parseInt(d.id) === parseInt(id)
            })
        });

        onDelete && onDelete(src);
    }


    handleInfiniteOnLoad = () => {
        const { page, maxPage } = this.state;
        const { fetchCallback } = this;

        if (page === maxPage) {
            this.setState({
                hasMore: false,
                loading: false,
            });

            return;
        }

        this.setState({
            loading: true,
        });

        Api.imageLibs.load(page + 1, fetchCallback, 'engage');

    };



    renderListItem = (item, key, style) => {
        const c = [ 'images' ];
        const { active } = this.state;
        const { handleChoose, handleDelete } = this;

        if (active.indexOf(item.id) !== -1) {
            c.push('active');
        }
        
        return (
            <List.Item key={ key }>
                <div className={ c.join(' ') } onClick={ () => handleChoose(item.id, item.src) }>
                    <LazyLoadImage key={ item.src } src={ item.thumbnail } effect="blur" />
                </div>
                <div className="remove" onClick={ () => handleDelete(item.id, item.src) }>
                    <i className="fal fa-times"></i>
                </div>
            </List.Item>
        )
    }



    render() {
        const { visible, data, loading, hasMore, modalLoading } = this.state;
        const { handleOpen, handleClose, renderListItem, handleSubmit, handleInfiniteOnLoad } = this;
        const orderedData = Object.values(data).sort((a, b) => a.order - b.order);

        return (
            <>
                <Button ghost type="link" size="small" onClick={ handleOpen }>
                    <i className="fal fa-cloud-upload" />
                    <span className="label">
                        { Language.t('Local File') }
                    </span>
                </Button>
                <Modal centered
                    wrapClassName="eg-modal"
                    title={Language.t('Choose From Local Library')}
                    width="80%"
                    visible={ visible }
                    onCancel={ handleClose }
                    onOk={ handleSubmit }
                    cancelButtonProps={{ ghost: true }}
                    okText={ Language.t('Choose') }
                    cancelText={ Language.t('Cancel') }
                >
                    <div className="field-media-picker">
                        <InfiniteScroll initialLoad={ false } pageStart={ 0 } loadMore={ handleInfiniteOnLoad } hasMore={ !loading && hasMore } useWindow={ false }>
                            <List grid={{ gutter: 10, column: 4 }} rowKey={ (record) => record.id } dataSource={ orderedData } split={ false } itemLayout="vertical" renderItem={ renderListItem }>
                                { loading && hasMore && <Loader /> }
                            </List>
                        </InfiniteScroll>
                    </div>
                    { modalLoading && <div className="loader"><Loader /></div> }
                </Modal>
            </>
        )
    }
}