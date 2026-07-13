/**
 * WPRaiz Content API Tool — Gutenberg Sidebar Panel
 *
 * Adds an "WPRaiz AI" panel in the block editor sidebar.
 * Pure JS, no build step — uses wp.* globals directly.
 */
(function () {
  var el = wp.element.createElement;
  var Fragment = wp.element.Fragment;
  var useState = wp.element.useState;
  var PluginSidebar = wp.editPost.PluginSidebar;
  var PluginSidebarMoreMenuItem = wp.editPost.PluginSidebarMoreMenuItem;
  var registerPlugin = wp.plugins.registerPlugin;
  var PanelBody = wp.components.PanelBody;
  var Button = wp.components.Button;
  var TextControl = wp.components.TextControl;
  var SelectControl = wp.components.SelectControl;
  var TextareaControl = wp.components.TextareaControl;
  var Notice = wp.components.Notice;
  var Spinner = wp.components.Spinner;
  var useSelect = wp.data.useSelect;
  var useDispatch = wp.data.useDispatch;
  var apiFetch = wp.apiFetch;

  var config = window.wpraizEditor || {};

  /* ── Icon SVG ── */
  var WPRaizIcon = el('svg', { width: 24, height: 24, viewBox: '0 0 24 24' },
    el('path', {
      d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8h-2V7h2v2z',
      fill: 'currentColor'
    })
  );

  /* ── Sidebar Component ── */
  function WPRaizSidebar() {
    var postId = useSelect(function (select) {
      return select('core/editor').getCurrentPostId();
    });
    var postTitle = useSelect(function (select) {
      return select('core/editor').getEditedPostAttribute('title');
    });
    var postContent = useSelect(function (select) {
      return select('core/editor').getEditedPostAttribute('content');
    });

    var editPost = useDispatch('core/editor').editPost;

    // State
    var _genLoading = useState(false);
    var genLoading = _genLoading[0]; var setGenLoading = _genLoading[1];

    var _seoLoading = useState(false);
    var seoLoading = _seoLoading[0]; var setSeoLoading = _seoLoading[1];

    var _rewriteLoading = useState(false);
    var rewriteLoading = _rewriteLoading[0]; var setRewriteLoading = _rewriteLoading[1];

    var _similarLoading = useState(false);
    var similarLoading = _similarLoading[0]; var setSimilarLoading = _similarLoading[1];

    var _topic = useState('');
    var topic = _topic[0]; var setTopic = _topic[1];

    var _rewriteAction = useState('improve_seo');
    var rewriteAction = _rewriteAction[0]; var setRewriteAction = _rewriteAction[1];

    var _notice = useState(null);
    var notice = _notice[0]; var setNotice = _notice[1];

    var _similarPosts = useState([]);
    var similarPosts = _similarPosts[0]; var setSimilarPosts = _similarPosts[1];

    /* ── Generate Content ── */
    function handleGenerate() {
      if (!topic) return;
      setGenLoading(true);
      setNotice(null);

      apiFetch({
        path: 'wpraiz/v2/generate-content',
        method: 'POST',
        data: { topic: topic, language: 'pt-BR', auto_publish: false }
      }).then(function (res) {
        editPost({ title: res.title, content: res.content, excerpt: res.excerpt || '' });
        setNotice({ status: 'success', msg: 'Content generated via ' + (res.provider || 'AI') + '!' });
        setTopic('');
      }).catch(function (err) {
        setNotice({ status: 'error', msg: err.message || 'Generation failed.' });
      }).finally(function () {
        setGenLoading(false);
      });
    }

    /* ── Generate SEO ── */
    function handleSEO() {
      if (!postId) return;
      setSeoLoading(true);
      setNotice(null);

      apiFetch({
        path: 'wpraiz/v2/quick-seo/' + postId,
        method: 'POST'
      }).then(function (res) {
        setNotice({ status: 'success', msg: 'SEO generated! Title: "' + res.seo_title + '"' });
      }).catch(function (err) {
        setNotice({ status: 'error', msg: err.message || 'SEO generation failed.' });
      }).finally(function () {
        setSeoLoading(false);
      });
    }

    /* ── Rewrite ── */
    function handleRewrite() {
      if (!postId) return;
      setRewriteLoading(true);
      setNotice(null);

      apiFetch({
        path: 'wpraiz/v2/rewrite-post',
        method: 'POST',
        data: { post_id: postId, action: rewriteAction, save: false }
      }).then(function (res) {
        var r = res.result;
        editPost({ title: r.title, content: r.content });
        setNotice({ status: 'success', msg: 'Post rewritten (' + rewriteAction + ') via ' + (res.provider || 'AI') + '.' });
      }).catch(function (err) {
        setNotice({ status: 'error', msg: err.message || 'Rewrite failed.' });
      }).finally(function () {
        setRewriteLoading(false);
      });
    }

    /* ── Search Similar ── */
    function handleSimilar() {
      if (!postTitle) return;
      setSimilarLoading(true);
      setSimilarPosts([]);

      apiFetch({
        path: 'wpraiz/v2/search-similar?title=' + encodeURIComponent(postTitle) + '&limit=5',
        method: 'GET'
      }).then(function (res) {
        var posts = res.similar_posts || res;
        setSimilarPosts(Array.isArray(posts) ? posts : []);
      }).catch(function () {
        setSimilarPosts([]);
      }).finally(function () {
        setSimilarLoading(false);
      });
    }

    /* ── Render ── */
    var isAnyLoading = genLoading || seoLoading || rewriteLoading;

    return el(Fragment, null,

      el(PluginSidebarMoreMenuItem, { target: 'wpraiz-sidebar', icon: WPRaizIcon }, 'WPRaiz AI'),

      el(PluginSidebar, {
        name: 'wpraiz-sidebar',
        title: 'WPRaiz AI',
        icon: WPRaizIcon
      },

        /* Notice */
        notice && el(Notice, {
          status: notice.status,
          isDismissible: true,
          onRemove: function () { setNotice(null); },
          style: { margin: '0 0 12px' }
        }, notice.msg),

        /* Status bar */
        el('div', { style: { padding: '12px 16px', background: '#f0f0f1', borderBottom: '1px solid #ddd', fontSize: '12px', color: '#666' } },
          config.hasProvider
            ? el('span', null, 'AI: ', el('strong', { style: { color: '#1e40af' } }, config.providerName),
                config.isPro ? el('span', { style: { marginLeft: 6, background: '#7c3aed', color: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700 } }, 'PRO') : null
              )
            : el('span', { style: { color: '#b91c1c' } }, 'No AI provider configured')
        ),

        /* Panel: Generate */
        el(PanelBody, { title: 'Generate Article', initialOpen: true },
          el('p', { style: { fontSize: 12, color: '#666', marginTop: 0 } }, 'Generate a full article from a topic using AI.'),
          el(TextareaControl, {
            label: 'Topic',
            value: topic,
            onChange: setTopic,
            placeholder: 'e.g. "10 WordPress SEO tips for 2026"',
            rows: 3
          }),
          el(Button, {
            variant: 'primary',
            onClick: handleGenerate,
            disabled: !topic || isAnyLoading || !config.hasProvider,
            isBusy: genLoading,
            style: { width: '100%', justifyContent: 'center' }
          }, genLoading ? el(Spinner, null) : 'Generate Content'),
          !config.isPro && el('p', { style: { fontSize: 11, color: '#b91c1c', marginTop: 8 } }, 'Requires Pro license.')
        ),

        /* Panel: Rewrite */
        el(PanelBody, { title: 'Rewrite Post', initialOpen: false },
          el('p', { style: { fontSize: 12, color: '#666', marginTop: 0 } }, 'Rewrite the current post content with AI.'),
          el(SelectControl, {
            label: 'Action',
            value: rewriteAction,
            options: [
              { label: 'Improve SEO', value: 'improve_seo' },
              { label: 'Fix Grammar', value: 'fix_grammar' },
              { label: 'Change Tone', value: 'change_tone' },
              { label: 'Expand', value: 'expand' },
              { label: 'Summarize', value: 'summarize' }
            ],
            onChange: setRewriteAction
          }),
          el(Button, {
            variant: 'secondary',
            onClick: handleRewrite,
            disabled: !postId || isAnyLoading || !config.hasProvider,
            isBusy: rewriteLoading,
            style: { width: '100%', justifyContent: 'center' }
          }, rewriteLoading ? el(Spinner, null) : 'Rewrite')
        ),

        /* Panel: SEO */
        el(PanelBody, { title: 'Auto-SEO', initialOpen: false },
          el('p', { style: { fontSize: 12, color: '#666', marginTop: 0 } },
            'Generate SEO title and meta description from your content.',
            config.seoPlugin ? el('span', null, ' Using ', el('strong', null, config.seoPlugin), '.') : null
          ),
          el(Button, {
            variant: 'secondary',
            onClick: handleSEO,
            disabled: !postId || isAnyLoading || !config.hasProvider,
            isBusy: seoLoading,
            style: { width: '100%', justifyContent: 'center' }
          }, seoLoading ? el(Spinner, null) : 'Generate SEO Meta')
        ),

        /* Panel: Similar Posts */
        el(PanelBody, { title: 'Similar Posts', initialOpen: false },
          el('p', { style: { fontSize: 12, color: '#666', marginTop: 0 } }, 'Find existing posts similar to this one.'),
          el(Button, {
            variant: 'secondary',
            onClick: handleSimilar,
            disabled: !postTitle || similarLoading,
            isBusy: similarLoading,
            style: { width: '100%', justifyContent: 'center', marginBottom: 12 }
          }, similarLoading ? el(Spinner, null) : 'Search Similar'),
          similarPosts.length > 0 && el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
            similarPosts.map(function (sp, i) {
              return el('li', { key: i, style: { padding: '6px 0', borderBottom: '1px solid #eee', fontSize: 12 } },
                el('a', { href: sp.edit_link || sp.url || '#', target: '_blank', style: { textDecoration: 'none' } },
                  sp.title || sp.post_title || 'Untitled'
                ),
                sp.score !== undefined && el('span', { style: { marginLeft: 6, color: '#999', fontSize: 11 } }, sp.score + '%')
              );
            })
          )
        ),

        /* Footer */
        el('div', { style: { padding: '16px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: 11, color: '#999' } },
          'WPRaiz Content API v' + (window.wpraizAdmin && window.wpraizAdmin.version || '2.0')
        )
      )
    );
  }

  registerPlugin('wpraiz-sidebar', {
    render: WPRaizSidebar,
    icon: WPRaizIcon
  });
})();
