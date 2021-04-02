import React from 'react';
import { Tabs } from 'antd';

import LocalFile from './LocalFile';
import LibraryFile from './LibraryFile';

import '../../node_modules/react-lazy-load-image-component/src/effects/blur.css';

const { TabPane } = Tabs;

export default class Manager extends React.PureComponent {

    editor = null;
    token = null;
    urls = {};
    labels = {};
    pexels = false;
    unsplash = false;


    constructor(props) {
        super(props);

        this.editor = props.editor;
        this.token = props.token;
        this.urls = props.urls;
        this.labels = props.labels;
        this.uploads = props.uploads;
        this.pexels = typeof props.pexels !== 'undefined' && props.pexels && props.pexels !== 'false' ? props.pexels : false;
        this.unsplash = typeof props.unsplash !== 'undefined' && props.unsplash && props.unsplash !== 'false' ? props.unsplash : false;

    }


    render() {
        const { editor, token, urls, labels, uploads, pexels, unsplash } = this;

        return (
            <Tabs defaultActiveKey="localFile">
                <TabPane tab={ labels.tabLocalFile } key="localFile">
                    <LocalFile editor={ editor } token={ token } urls={ urls } labels={ labels } uploads={ uploads } />
                </TabPane>
                
                { (pexels) &&
                <TabPane tab={ labels.tabPexelsFile } key="pexelsFile">
                    <LibraryFile api={ pexels } source="pexels" editor={ editor } labels={ labels } />
                </TabPane> }

                { (unsplash) && 
                <TabPane tab={ labels.tabUnsplashFile } key="unsplashFile">
                    <LibraryFile api={ unsplash } source="unsplash" editor={ editor } labels={ labels } />
                </TabPane> }
            </Tabs>
        )
    }
}