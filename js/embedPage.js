(function () {


    /**
     * Main function
     */
    function main() {
        jQuery(document).ready(function ($) {
            // Setup the UI elements
            initUi();
        });
    }

    /**
     * Initialize UI elements, not include JavaScript
     */
    function initUi() {
        loadCss();
        setupIframe();
    }

    /**
     * Load widget CSS styles.
     * Minimal styles, intendend to style containing bubble for the iframe
     */
    function loadCss() {
        var cssId = 'gtr_embed_css';
        if (!document.getElementById(cssId)) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = 'https://advocator.getthereferral.com/webapp/css/embed.css?ver=1.08';
            link.media = 'all';
            head.appendChild(link);
        }
    }

    /**
     * Setup the iframe
     */
    function setupIframe() {
        var myTags = document.getElementsByTagName("script");
        var src = myTags[myTags.length - 1].src;
        var companyCode = unescape(src).split("companyCode=")[1];
        if (companyCode === undefined || companyCode === "") {
            var myTags = document.getElementById("embedScript");
            var src = myTags.getAttribute("src");
            var companyCode = unescape(src).split("companyCode=")[1];
        }

        // var companyCode = unescape(document.currentScript.src).split("companyCode=")[1].split("&")[0];
        // console.log(companyCode);

        // let searchParams = new URLSearchParams(window.location.search);
        // searchParams.has('companyCode') // true
        // let companyCode = searchParams.get('companyCode');
        var html = [];
        var iframe_url = 'https://advocator.getthereferral.com/webapp/partnerPages.php?companyCode=' + companyCode;
        /*if(companyCode==5789)
        html.push('<div class="gtr-embed-iframe_scripts" id="gtr_embed_iframe"><iframe src="' + iframe_url + '" frameborder="0"></iframe></div>');
        else*/
        html.push('<div class="gtr-embed-iframe" id="gtr_embed_iframe"><iframe src="' + iframe_url + '" frameborder="0"></iframe></div>');
        document.body.insertAdjacentHTML('beforeend', html.join("\n"));
    }

    function setupIframe_new() {
        var myTags = document.getElementById("embedScript");
        var src = myTags.getAttribute("src");

        var companyCode = unescape(src).split("companyCode=")[1].split("&")[0];

        var html = [];
        var iframe_url = 'https://advocator.getthereferral.com/webapp/partnerPages.php?companyCode=' + companyCode;
        html.push('<div class="gtr-embed-iframe" id="gtr_embed_iframe"><iframe src="' + iframe_url + '" frameborder="0"></iframe></div>');
        document.body.insertAdjacentHTML('beforeend', html.join("\n"));
    }

    /**
     * Callback once the plugin's version of jQuery is available.
     */
    function scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        // Call our main function
        main();
    }


    // Load and localize the version of jQuery this plugin depends on.
    if (window.jQuery === undefined) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function () { // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler();
                }
            };
        } else {
            script_tag.onload = scriptLoadHandler;
        }
        // Append to head
        document.getElementsByTagName("head")[0].appendChild(script_tag);
    } else {
        // The jQuery version on the window is the one we want to use
        jQuery = window.jQuery;
        main();
    }


})();