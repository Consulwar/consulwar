(function () {

    function ChdFeedbackWidget() {
        this.config = {};
    }

    ChdFeedbackWidget.prototype = {

        init : function (cfg) {
            this.config = cfg;
            this.closeDom = null;
            this.tabDom = null;
        },

        bind: function (func, context) {
            return function () {
                return func.apply(context, arguments);
            };
        },

        setPosition : function (position, dom) {
            var domWidth, domHeight,
                borderRadius,
                windowWidth = self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                windowHeight = self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

            dom.style.left = '-200px';
            dom.style.display = 'block';

            borderRadius = this.tabBorderRadius;

            domWidth = dom.offsetWidth;
            domHeight = dom.offsetHeight;

            if (this.tabWidth && this.tabHeight) {
                domWidth = this.tabWidth;
                domHeight = this.tabHeight;
            } else {
                this.tabWidth = domWidth;
                this.tabHeight = domHeight;
            }

            dom.style.display = 'none';

            dom.style.borderTopRightRadius = borderRadius;
            dom.style.borderTopLeftRadius = borderRadius;

            if (position.search('left') !== -1) {
                dom.style.left = '15px';
            } else if (position.search('right') !== -1) {
                dom.style.left = 'auto';
                dom.style.right = '15px';
            }

            if (position.search('top') === -1 && position.search('bottom') === -1) {
                dom.style.top = '50%';
                dom.style.marginTop = 0 - domHeight/2 + 'px';
            }

            if (position.search('top') !== -1) {
                dom.style.top = '0px';

                dom.style.borderTopWidth = '0';

                dom.style.borderRadius = '0';
                dom.style.borderBottomLeftRadius = borderRadius;
                dom.style.borderBottomRightRadius = borderRadius;

				this.closeDom.style.bottom = 'auto';
				this.closeDom.style.top = '19px';

                this.setTransform('translate(0,0)', dom);
            }

            if (position.search('bottom') !== -1) {
                dom.style.top = 'auto';
                dom.style.bottom = '0px';

                dom.style.borderBottomWidth = '0';

                this.setTransform('translate(0,0)', dom);
            }

            if (position === 'left') {
                if((navigator.appVersion.indexOf("MSIE 8.") >= 0) || (navigator.appVersion.indexOf("MSIE 7.") >= 0)) {
                    dom.style['writing-mode'] = "tb-rl";

                    dom.style.padding = '10px 6px';
                    dom.style.marginTop = (0 - domWidth/2) + 'px';
                    dom.style.left = 0;

                    dom.style.borderWidth = '1px 2px 1px 0';
                } else {
                    this.setTransform('rotate(90deg) translate(0,0)', dom);

                    dom.style.left = 0 - domWidth/2 + domHeight/2 - 1 + 'px';

                    dom.style.borderBottomWidth = '0';
                }
                dom.style.borderRadius = '0';
                dom.style.borderTopLeftRadius = borderRadius;
                dom.style.borderTopRightRadius = borderRadius;
            }

            if (position === 'right') {
               if((navigator.appVersion.indexOf("MSIE 8.") >= 0) || (navigator.appVersion.indexOf("MSIE 7.") >= 0)) {
                    dom.style['writing-mode'] = "tb-rl";

                    dom.style.padding = '10px 6px';
                    dom.style.marginTop = (0 - domWidth/2) + 'px';
                    dom.style.right = 0;

                    dom.style.borderWidth = '1px 0 1px 2px';
                } else {
                    this.setTransform('rotate(90deg) translate(0,0)', dom);

                    dom.style.right = 0 - domWidth/2 + domHeight/2 - 1 + 'px';

                    dom.style.borderTopWidth = '0';
                }
                dom.style.borderRadius = '0';
                dom.style.borderBottomLeftRadius = borderRadius;
                dom.style.borderBottomRightRadius = borderRadius;
            }
        },

        setTabAnimation : function (position, dom) {
            dom.style['-ms-transition'] = '-ms-transform 0.5s';
            dom.style['-moz-transition'] = '-moz-transform 0.5s';
            dom.style['-webkit-transition'] = '-webkit-transform 0.5s';
            dom.style['-o-transition'] = '-o-transform 0.5s';
            dom.style.transition = 'transform 0.5s';
            if (position.search('top') !== -1) {
                this.setTransform('translate(0,-25px)', dom);
            }

            if (position.search('bottom') !== -1) {
                this.setTransform('translate(0,25px)', dom);
            }

            if (position === 'left') {
                this.setTransform('rotate(90deg) translate(0,25px)', dom);
            }

            if (position === 'right') {
                this.setTransform('rotate(90deg) translate(0,-25px)', dom);
            }
        },

        setTransform : function (prop, dom) {
            var browserArray = ['-ms-', '-moz-', '-webkit-', '-o-', ''];
            for (var i = 0; i < browserArray.length; i++) {
                var bi = browserArray[i];
                dom.style[bi + 'transform'] = prop;
            }
        },

        createTab : function () {
            var span,
                dom = '',
				close = '',
                cfg = this.config,
                position = cfg.tabPosition;

            dom = document.createElement('div');

            close = document.createElement('span');
            close.style.position = 'absolute';
            if (position === 'right') {
                close.style.bottom = '-9px';
            } else {
                close.style.bottom = '19px';
            }
            close.style.right = '-8px';
            close.style.color = '#FFFFFF';
            close.style.textAlign = 'center';
            close.style.display = 'block';
            close.style.width = '15px';
            close.style.height = '15px';
            close.style.fontSize = '16px';
            close.style.lineHeight = '14px';
            if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
            {
                close.style.lineHeight = '12px';
            }
            close.style.backgroundColor = '#8b8b8b';
            close.style.borderRadius = '10px';
            close.style.border = '1px solid #FFF';
            close.innerHTML = '&times;';
            close.style.opacity = '0';
            if((navigator.appVersion.indexOf("MSIE 8.") >= 0) || (navigator.appVersion.indexOf("MSIE 7.") >= 0)) {
                close.style.filter = "alpha(opacity=0)";
            }

            close.onclick = this.bind(this.hideTab, this);

            //cfg.tabPosition = 'right';
            this.tabBorderRadius = '5px';

            dom.style.position = 'fixed';
            dom.style.backgroundColor = cfg.tabBgColor || '#78a300';
            dom.style.color = cfg.tabTextColor || '#FFFFFF';
            dom.style.display = 'none';
            dom.style.width = 'initial';
            dom.style.height = 'initial';
            dom.style.whiteSpace = 'nowrap';
            dom.style.zIndex = '2147483647';

            dom.onmouseover = this.bind(this.showClose, this);
            dom.onmouseout = this.bind(this.hideClose, this);
            dom.onclick = this.bind(function () {
                this.show();
            }, this);

            span = document.createElement('span');
            span.innerHTML = cfg.tabTitle;

            dom.appendChild(span);
            dom.appendChild(close);
            this.setTabAnimation(cfg.tabPosition, dom);
            document.body.appendChild(dom);

            dom.style.border = '1px solid #FFF';
            dom.style.borderWidth = '2px 1px';
            dom.style.boxShadow = '0 0 3px rgba(0,0,0,0.3)';
            dom.style.padding = '6px 10px';

            dom.style.fontSize = '14px';
            dom.style.lineHeight = '14px';
            dom.style.fontFamily = 'Arial, Helvetica, sans-serif';

            dom.style.cursor = 'pointer';

            this.tabDom = dom;
            this.closeDom = close;

            this.setPosition(cfg.tabPosition, dom);
        },

        showTab : function () {
            if (this.config.feedbackType !== 'tab') {
                return;
            }
            if (!this.tabDom) {
                this.createTab();
            }
            this.tabDom.style.display = 'block';
        },

        hideTab : function (event) {
            this.tabDom.style.display = 'none';
            event = event || window.event;
            if (event.stopPropagation) {
                    event.stopPropagation();
            } else {
                    event.cancelBubble = true;
            }
        },

        showClose : function () {
            this.closeDom.style.opacity = '1';
            if((navigator.appVersion.indexOf("MSIE 8.") >= 0) || (navigator.appVersion.indexOf("MSIE 7.") >= 0)) {
                    this.closeDom.style.filter = "alpha(opacity=100)";
            }
        },

        hideClose : function () {
            this.closeDom.style.opacity = '0';
            if((navigator.appVersion.indexOf("MSIE 8.") >= 0) || (navigator.appVersion.indexOf("MSIE 7.") >= 0)) {
                    this.closeDom.style.filter = "alpha(opacity=0)";
            }
        },

        createDialog : function () {
            var dialogContainer, dialogContainerInner, dialogHolder, closebtn, closebtnLayer,
                iframeEl, brandingFooter, dom, glass,
                windowWidth = document.body.clientWidth,
                windowHeight = self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                iframeWidth = 1020,
                iframeHeight = 560,
                iframeTop = Math.round((windowHeight - iframeHeight) / 2),
                iframeLeft = Math.round((windowWidth - iframeWidth) / 2);

            dom = document.createElement('div');
            dom.style.position = 'fixed';
            dom.style.top = '0';
            dom.style.left = '0';
            dom.style.display = 'none';
            dom.style.width = '100%';
            dom.style.height = '100%';
            dom.style.backgroundColor = 'transparent !important';
            dom.style.zIndex = '1000000000';

            glass = document.createElement('div');
            glass.style.position = 'fixed';
            glass.style.top = '0';
            glass.style.left = '0';
            glass.style.display = 'block';
            glass.style.width = '100%';
            glass.style.height = '100%';
            glass.style.backgroundColor = '#000';
            glass.style.opacity = '.75';
            glass.style.filter = 'alpha(opacity=75)';

            dialogContainer = document.createElement('div');
            dialogContainer.style.position = 'absolute';
            dialogContainer.style.top = '0';
            dialogContainer.style.left = '0';
            dialogContainer.style.right = '0';
            dialogContainer.style.bottom = '0';
            dialogContainer.style.overflow = 'auto';
            dialogContainer.style.backgroundColor = 'transparent !important';

            dialogContainerInner = document.createElement('div');
            dialogContainerInner.style.position = 'absolute';
            dialogContainerInner.style.top = '0';
            dialogContainerInner.style.left = '0';
            dialogContainerInner.style.right = '0';
            dialogContainerInner.style.bottom = '0';
            dialogContainerInner.style.minWidth = iframeWidth + 'px';
            dialogContainerInner.style.minHeight = iframeHeight + 'px';
            dialogContainerInner.style.backgroundColor = 'transparent !important';

            dialogHolder = document.createElement('div');
            dialogHolder.style.position = 'absolute';
            dialogHolder.style.top = '50%';
            dialogHolder.style.left = '50%';
            dialogHolder.style.marginTop = 0 - iframeHeight/2 + 'px';
            dialogHolder.style.marginLeft = 0 - iframeWidth/2 + 'px';

            dialogHolder.style.backgroundColor = 'transparent !important';

            iframeEl = document.createElement('iframe');
            iframeEl.id = "chd-widget";
            iframeEl.frameBorder = "0";
            iframeEl.allowTransprency = "true";
            iframeEl.style.width = iframeWidth + 'px';
            iframeEl.style.height = iframeHeight + 'px';
            iframeEl.style.padding = '8px';
            iframeEl.style.border = 'none';
            iframeEl.style.background = '#fcfcfc';
            iframeEl.style.border = '1px solid #A6A6A6';
            iframeEl.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.7)';
            iframeEl.style.borderRadius = '3px';
            iframeEl.style.overflow = 'hidden';
            iframeEl.style.webkitBoxSizing = 'content-box';
            iframeEl.style.MozBoxSizing = 'content-box';
            iframeEl.style.boxSizing = 'content-box';

            closebtn = document.createElement('div');
            closebtn.style.width = '48px';
            closebtn.style.height = '48px';
            closebtn.style.position = 'absolute';
            closebtn.style.top = '-24px';
            closebtn.style.right = '-24px';
            closebtn.onclick = this.bind(this.hideDialog, this);
            
            closebtnImg = document.createElement('img');
            closebtnImg.style.width = '48px';
            closebtnImg.style.height = '48px';
            closebtnImg.src = this.config.assetsUrl + 'images/closeDialog.png';
            closebtnImg.style.position = 'absolute';
            closebtnImg.style.top = '0';
            closebtnImg.style.right = '0';

            closebtnLayer = document.createElement('div');
            closebtnLayer.style.width = '30px';
            closebtnLayer.style.height = '30px';
            closebtnLayer.style.cursor = 'pointer';
            closebtnLayer.style.position = 'relative';
            closebtnLayer.style.top = '6px';
            closebtnLayer.style.left = '9px';

            brandingFooter = document.createElement('div');
            //brandingFooter.innerHTML = '<a style="color:#AAA; font-family: Arial, Helvetica, sans-serif; text-decoration: none;" '
            //    + 'href="' + (window.feedbackKeywords.url) + '">'
            //    + (window.feedbackKeywords.content)
            //    + '</a> '
            //    + 'by <a style="color:#AAA; font-family: Arial, Helvetica, sans-serif; text-decoration: none;" href="http://helprace.com">Helprace</a>';
            brandingFooter.style.display = 'block'; //  !important
            brandingFooter.style.textAlign = 'right';
            brandingFooter.style.color = '#AAA';
            brandingFooter.style.fontSize = '12px';
            brandingFooter.style.fontFamily = 'Arial, Helvetica, sans-serif';
            brandingFooter.style.margin = '5px 5px 0 0';
            brandingFooter.style.textDecoration = 'none';

            closebtn.appendChild(closebtnImg);
            closebtn.appendChild(closebtnLayer);
            dom.appendChild(glass);
            dom.appendChild(dialogContainer);
            dialogContainer.appendChild(dialogContainerInner);
            dialogContainerInner.appendChild(dialogHolder);
            dialogHolder.appendChild(closebtn);
            dialogHolder.appendChild(iframeEl);
            dialogHolder.appendChild(brandingFooter);
            document.body.appendChild(dom);

            this.dlgDom = dom;
            this.iframeEl = iframeEl;
        },

        show : function (name) {
            if (this.config.tabAction === 'true') {
                window.open(this.config.url, "_blank");
                return;
            }
            if (!this.dlgDom) {
                this.createDialog();
            }
            this.dlgDom.style.display = 'block';
            this.iframeEl.src = this.config.url + (name ? '#' + name : '');
        },

        hideDialog : function () {
            this.dlgDom.style.display = 'none';
        }
    };

    window.ChdFeedbackWidget = new ChdFeedbackWidget();

    window.onload = function () {
        var feedbackDomain,
            script = document.createElement('script');

        feedbackDomain = window.ChdFeedbackWidget.config.url.replace(/(http|https|):/, '').replace(/(chd-widgets\/feedback)(.*)/, '');
        script.src = feedbackDomain + 'chd-widget/feedback/get-account-keyword';

        script.onload = function () {
            window.ChdFeedbackWidget.showTab();
        };

        document.getElementsByTagName('body')[0].appendChild(script);
    };
    /*window.onresize = function () {
        window.ChdFeedbackWidget.showTab();
    };*/
}());