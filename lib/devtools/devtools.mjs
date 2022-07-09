import _extends from "@babel/runtime/helpers/extends";
import React from 'react';
import { useSyncExternalStore } from "../reactjs/useSyncExternalStore.mjs";
import { useQueryClient, onlineManager, notifyManager } from 'react-query';
import { matchSorter } from 'match-sorter';
import useLocalStorage from "./useLocalStorage.mjs";
import { useIsMounted } from "./utils.mjs";
import { Panel, QueryKeys, QueryKey, Button, Code, Input, Select, ActiveQueryPanel } from "./styledComponents.mjs";
import { ThemeProvider, defaultTheme as theme } from "./theme.mjs";
import { getQueryStatusLabel, getQueryStatusColor } from "./utils.mjs";
import Explorer from "./Explorer.mjs";
import Logo from "./Logo.mjs";
import { noop } from "../core/utils.mjs";
const isServer = typeof window === 'undefined';
export function ReactQueryDevtools({
  initialIsOpen,
  panelProps = {},
  closeButtonProps = {},
  toggleButtonProps = {},
  position = 'bottom-left',
  containerElement: Container = 'aside',
  context,
  styleNonce
}) {
  const rootRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const [isOpen, setIsOpen] = useLocalStorage('reactQueryDevtoolsOpen', initialIsOpen);
  const [devtoolsHeight, setDevtoolsHeight] = useLocalStorage('reactQueryDevtoolsHeight', null);
  const [isResolvedOpen, setIsResolvedOpen] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const isMounted = useIsMounted();

  const handleDragStart = (panelElement, startEvent) => {
    var _panelElement$getBoun;

    if (startEvent.button !== 0) return; // Only allow left click for drag

    setIsResizing(true);
    const dragInfo = {
      originalHeight: (_panelElement$getBoun = panelElement == null ? void 0 : panelElement.getBoundingClientRect().height) != null ? _panelElement$getBoun : 0,
      pageY: startEvent.pageY
    };

    const run = moveEvent => {
      const delta = dragInfo.pageY - moveEvent.pageY;
      const newHeight = dragInfo.originalHeight + delta;
      setDevtoolsHeight(newHeight);

      if (newHeight < 70) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    const unsub = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', run);
      document.removeEventListener('mouseUp', unsub);
    };

    document.addEventListener('mousemove', run);
    document.addEventListener('mouseup', unsub);
  };

  React.useEffect(() => {
    setIsResolvedOpen(isOpen != null ? isOpen : false);
  }, [isOpen, isResolvedOpen, setIsResolvedOpen]); // Toggle panel visibility before/after transition (depending on direction).
  // Prevents focusing in a closed panel.

  React.useEffect(() => {
    const ref = panelRef.current;

    if (ref) {
      const handlePanelTransitionStart = () => {
        if (isResolvedOpen) {
          ref.style.visibility = 'visible';
        }
      };

      const handlePanelTransitionEnd = () => {
        if (!isResolvedOpen) {
          ref.style.visibility = 'hidden';
        }
      };

      ref.addEventListener('transitionstart', handlePanelTransitionStart);
      ref.addEventListener('transitionend', handlePanelTransitionEnd);
      return () => {
        ref.removeEventListener('transitionstart', handlePanelTransitionStart);
        ref.removeEventListener('transitionend', handlePanelTransitionEnd);
      };
    }
  }, [isResolvedOpen]);
  React[isServer ? 'useEffect' : 'useLayoutEffect'](() => {
    if (isResolvedOpen) {
      var _rootRef$current, _rootRef$current$pare;

      const previousValue = (_rootRef$current = rootRef.current) == null ? void 0 : (_rootRef$current$pare = _rootRef$current.parentElement) == null ? void 0 : _rootRef$current$pare.style.paddingBottom;

      const run = () => {
        var _panelRef$current, _rootRef$current2;

        const containerHeight = (_panelRef$current = panelRef.current) == null ? void 0 : _panelRef$current.getBoundingClientRect().height;

        if ((_rootRef$current2 = rootRef.current) != null && _rootRef$current2.parentElement) {
          rootRef.current.parentElement.style.paddingBottom = containerHeight + "px";
        }
      };

      run();

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', run);
        return () => {
          var _rootRef$current3;

          window.removeEventListener('resize', run);

          if ((_rootRef$current3 = rootRef.current) != null && _rootRef$current3.parentElement && typeof previousValue === 'string') {
            rootRef.current.parentElement.style.paddingBottom = previousValue;
          }
        };
      }
    }
  }, [isResolvedOpen]);
  const {
    style: panelStyle = {},
    ...otherPanelProps
  } = panelProps;
  const {
    style: closeButtonStyle = {},
    onClick: onCloseClick,
    ...otherCloseButtonProps
  } = closeButtonProps;
  const {
    style: toggleButtonStyle = {},
    onClick: onToggleClick,
    ...otherToggleButtonProps
  } = toggleButtonProps; // Do not render on the server

  if (!isMounted()) return null;
  return /*#__PURE__*/React.createElement(Container, {
    ref: rootRef,
    className: "ReactQueryDevtools",
    "aria-label": "React Query Devtools"
  }, /*#__PURE__*/React.createElement(ThemeProvider, {
    theme: theme
  }, /*#__PURE__*/React.createElement(ReactQueryDevtoolsPanel, _extends({
    ref: panelRef,
    context: context,
    styleNonce: styleNonce
  }, otherPanelProps, {
    style: {
      position: 'fixed',
      bottom: '0',
      right: '0',
      zIndex: 99999,
      width: '100%',
      height: devtoolsHeight != null ? devtoolsHeight : 500,
      maxHeight: '90%',
      boxShadow: '0 0 20px rgba(0,0,0,.3)',
      borderTop: "1px solid " + theme.gray,
      transformOrigin: 'top',
      // visibility will be toggled after transitions, but set initial state here
      visibility: isOpen ? 'visible' : 'hidden',
      ...panelStyle,
      ...(isResizing ? {
        transition: "none"
      } : {
        transition: "all .2s ease"
      }),
      ...(isResolvedOpen ? {
        opacity: 1,
        pointerEvents: 'all',
        transform: "translateY(0) scale(1)"
      } : {
        opacity: 0,
        pointerEvents: 'none',
        transform: "translateY(15px) scale(1.02)"
      })
    },
    isOpen: isResolvedOpen,
    setIsOpen: setIsOpen,
    handleDragStart: e => handleDragStart(panelRef.current, e)
  })), isResolvedOpen ? /*#__PURE__*/React.createElement(Button, _extends({
    type: "button",
    "aria-controls": "ReactQueryDevtoolsPanel",
    "aria-haspopup": "true",
    "aria-expanded": "true"
  }, otherCloseButtonProps, {
    onClick: e => {
      setIsOpen(false);
      onCloseClick == null ? void 0 : onCloseClick(e);
    },
    style: {
      position: 'fixed',
      zIndex: 99999,
      margin: '.5em',
      bottom: 0,
      ...(position === 'top-right' ? {
        right: '0'
      } : position === 'top-left' ? {
        left: '0'
      } : position === 'bottom-right' ? {
        right: '0'
      } : {
        left: '0'
      }),
      ...closeButtonStyle
    }
  }), "Close") : null), !isResolvedOpen ? /*#__PURE__*/React.createElement("button", _extends({
    type: "button"
  }, otherToggleButtonProps, {
    "aria-label": "Open React Query Devtools",
    "aria-controls": "ReactQueryDevtoolsPanel",
    "aria-haspopup": "true",
    "aria-expanded": "false",
    onClick: e => {
      setIsOpen(true);
      onToggleClick == null ? void 0 : onToggleClick(e);
    },
    style: {
      background: 'none',
      border: 0,
      padding: 0,
      position: 'fixed',
      zIndex: 99999,
      display: 'inline-flex',
      fontSize: '1.5em',
      margin: '.5em',
      cursor: 'pointer',
      width: 'fit-content',
      ...(position === 'top-right' ? {
        top: '0',
        right: '0'
      } : position === 'top-left' ? {
        top: '0',
        left: '0'
      } : position === 'bottom-right' ? {
        bottom: '0',
        right: '0'
      } : {
        bottom: '0',
        left: '0'
      }),
      ...toggleButtonStyle
    }
  }), /*#__PURE__*/React.createElement(Logo, {
    "aria-hidden": true
  })) : null);
}

const getStatusRank = q => q.state.fetchStatus !== 'idle' ? 0 : !q.getObserversCount() ? 3 : q.isStale() ? 2 : 1;

const sortFns = {
  'Status > Last Updated': (a, b) => {
    var _sortFns$LastUpdated;

    return getStatusRank(a) === getStatusRank(b) ? (_sortFns$LastUpdated = sortFns['Last Updated']) == null ? void 0 : _sortFns$LastUpdated.call(sortFns, a, b) : getStatusRank(a) > getStatusRank(b) ? 1 : -1;
  },
  'Query Hash': (a, b) => a.queryHash > b.queryHash ? 1 : -1,
  'Last Updated': (a, b) => a.state.dataUpdatedAt < b.state.dataUpdatedAt ? 1 : -1
};

const useSubscribeToQueryCache = (queryCache, getSnapshot) => {
  return useSyncExternalStore(React.useCallback(onStoreChange => queryCache.subscribe(notifyManager.batchCalls(onStoreChange)), [queryCache]), getSnapshot, getSnapshot);
};

export const ReactQueryDevtoolsPanel = /*#__PURE__*/React.forwardRef(function ReactQueryDevtoolsPanel(props, ref) {
  const {
    isOpen = true,
    styleNonce,
    setIsOpen,
    handleDragStart,
    context,
    ...panelProps
  } = props;
  const queryClient = useQueryClient({
    context
  });
  const queryCache = queryClient.getQueryCache();
  const [sort, setSort] = useLocalStorage('reactQueryDevtoolsSortFn', Object.keys(sortFns)[0]);
  const [filter, setFilter] = useLocalStorage('reactQueryDevtoolsFilter', '');
  const [sortDesc, setSortDesc] = useLocalStorage('reactQueryDevtoolsSortDesc', false);
  const sortFn = React.useMemo(() => sortFns[sort], [sort]);
  React[isServer ? 'useEffect' : 'useLayoutEffect'](() => {
    if (!sortFn) {
      setSort(Object.keys(sortFns)[0]);
    }
  }, [setSort, sortFn]);
  const queriesCount = useSubscribeToQueryCache(queryCache, () => queryCache.getAll().length);
  const [activeQueryHash, setActiveQueryHash] = useLocalStorage('reactQueryDevtoolsActiveQueryHash', '');
  const queries = React.useMemo(() => {
    const unsortedQueries = queryCache.getAll();
    const sorted = queriesCount > 0 ? [...unsortedQueries].sort(sortFn) : [];

    if (sortDesc) {
      sorted.reverse();
    }

    if (!filter) {
      return sorted;
    }

    return matchSorter(sorted, filter, {
      keys: ['queryHash']
    }).filter(d => d.queryHash);
  }, [sortDesc, sortFn, filter, queriesCount, queryCache]);
  const [isMockOffline, setMockOffline] = React.useState(false);
  return /*#__PURE__*/React.createElement(ThemeProvider, {
    theme: theme
  }, /*#__PURE__*/React.createElement(Panel, _extends({
    ref: ref,
    className: "ReactQueryDevtoolsPanel",
    "aria-label": "React Query Devtools Panel",
    id: "ReactQueryDevtoolsPanel"
  }, panelProps), /*#__PURE__*/React.createElement("style", {
    nonce: styleNonce,
    dangerouslySetInnerHTML: {
      __html: "\n            .ReactQueryDevtoolsPanel * {\n              scrollbar-color: " + theme.backgroundAlt + " " + theme.gray + ";\n            }\n\n            .ReactQueryDevtoolsPanel *::-webkit-scrollbar, .ReactQueryDevtoolsPanel scrollbar {\n              width: 1em;\n              height: 1em;\n            }\n\n            .ReactQueryDevtoolsPanel *::-webkit-scrollbar-track, .ReactQueryDevtoolsPanel scrollbar-track {\n              background: " + theme.backgroundAlt + ";\n            }\n\n            .ReactQueryDevtoolsPanel *::-webkit-scrollbar-thumb, .ReactQueryDevtoolsPanel scrollbar-thumb {\n              background: " + theme.gray + ";\n              border-radius: .5em;\n              border: 3px solid " + theme.backgroundAlt + ";\n            }\n          "
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '4px',
      marginBottom: '-4px',
      cursor: 'row-resize',
      zIndex: 100000
    },
    onMouseDown: handleDragStart
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 500px',
      minHeight: '40%',
      maxHeight: '100%',
      overflow: 'auto',
      borderRight: "1px solid " + theme.grayAlt,
      display: isOpen ? 'flex' : 'none',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '.5em',
      background: theme.backgroundAlt,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Close React Query Devtools",
    "aria-controls": "ReactQueryDevtoolsPanel",
    "aria-haspopup": "true",
    "aria-expanded": "true",
    onClick: () => setIsOpen(false),
    style: {
      display: 'inline-flex',
      background: 'none',
      border: 0,
      padding: 0,
      marginRight: '.5em',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    "aria-hidden": true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(QueryStatusCount, {
    queryCache: queryCache
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Filter",
    "aria-label": "Filter by queryhash",
    value: filter != null ? filter : '',
    onChange: e => setFilter(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Escape') setFilter('');
    },
    style: {
      flex: '1',
      marginRight: '.5em',
      width: '100%'
    }
  }), !filter ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Select, {
    "aria-label": "Sort queries",
    value: sort,
    onChange: e => setSort(e.target.value),
    style: {
      flex: '1',
      minWidth: 75,
      marginRight: '.5em'
    }
  }, Object.keys(sortFns).map(key => /*#__PURE__*/React.createElement("option", {
    key: key,
    value: key
  }, "Sort by ", key))), /*#__PURE__*/React.createElement(Button, {
    type: "button",
    onClick: () => setSortDesc(old => !old),
    style: {
      padding: '.3em .4em',
      marginRight: '.5em'
    }
  }, sortDesc ? '⬇ Desc' : '⬆ Asc'), /*#__PURE__*/React.createElement(Button, {
    type: "button",
    onClick: () => {
      if (isMockOffline) {
        onlineManager.setOnline(undefined);
        setMockOffline(false);
        window.dispatchEvent(new Event('online'));
      } else {
        onlineManager.setOnline(false);
        setMockOffline(true);
      }
    },
    "aria-label": isMockOffline ? 'Restore offline mock' : 'Mock offline behavior',
    title: isMockOffline ? 'Restore offline mock' : 'Mock offline behavior',
    style: {
      padding: '0',
      height: '2em'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "2em",
    height: "2em",
    viewBox: "0 0 24 24",
    stroke: isMockOffline ? theme.danger : 'currentColor',
    fill: "none"
  }, isMockOffline ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "18",
    x2: "12.01",
    y2: "18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.172 15.172a4 4 0 0 1 5.656 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.515 9.515a12 12 0 0 1 3.544 -2.455m3.101 -.92a12 12 0 0 1 10.325 3.374"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "3",
    x2: "21",
    y2: "21"
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    stroke: "none",
    d: "M0 0h24v24H0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "18",
    x2: "12.01",
    y2: "18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.172 15.172a4 4 0 0 1 5.656 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.343 12.343a8 8 0 0 1 11.314 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.515 9.515c4.686 -4.687 12.284 -4.687 17 0"
  }))))) : null))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: 'auto',
      flex: '1'
    }
  }, queries.map(query => {
    return /*#__PURE__*/React.createElement(QueryRow, {
      queryKey: query.queryKey,
      activeQueryHash: activeQueryHash,
      setActiveQueryHash: setActiveQueryHash,
      key: query.queryHash,
      queryCache: queryCache
    });
  }))), activeQueryHash ? /*#__PURE__*/React.createElement(ActiveQuery, {
    activeQueryHash: activeQueryHash,
    queryCache: queryCache,
    queryClient: queryClient
  }) : null));
});

const ActiveQuery = ({
  queryCache,
  activeQueryHash,
  queryClient
}) => {
  var _useSubscribeToQueryC, _useSubscribeToQueryC2;

  const activeQuery = useSubscribeToQueryCache(queryCache, () => queryCache.getAll().find(query => query.queryHash === activeQueryHash));
  const activeQueryState = useSubscribeToQueryCache(queryCache, () => {
    var _queryCache$getAll$fi;

    return (_queryCache$getAll$fi = queryCache.getAll().find(query => query.queryHash === activeQueryHash)) == null ? void 0 : _queryCache$getAll$fi.state;
  });
  const isStale = (_useSubscribeToQueryC = useSubscribeToQueryCache(queryCache, () => {
    var _queryCache$getAll$fi2;

    return (_queryCache$getAll$fi2 = queryCache.getAll().find(query => query.queryHash === activeQueryHash)) == null ? void 0 : _queryCache$getAll$fi2.isStale();
  })) != null ? _useSubscribeToQueryC : false;
  const observerCount = (_useSubscribeToQueryC2 = useSubscribeToQueryCache(queryCache, () => {
    var _queryCache$getAll$fi3;

    return (_queryCache$getAll$fi3 = queryCache.getAll().find(query => query.queryHash === activeQueryHash)) == null ? void 0 : _queryCache$getAll$fi3.getObserversCount();
  })) != null ? _useSubscribeToQueryC2 : 0;

  const handleRefetch = () => {
    const promise = activeQuery == null ? void 0 : activeQuery.fetch();
    promise == null ? void 0 : promise.catch(noop);
  };

  if (!activeQuery || !activeQueryState) {
    return null;
  }

  return /*#__PURE__*/React.createElement(ActiveQueryPanel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '.5em',
      background: theme.backgroundAlt,
      position: 'sticky',
      top: 0,
      zIndex: 1
    }
  }, "Query Details"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '.5em'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '.5em',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Code, {
    style: {
      lineHeight: '1.8em'
    }
  }, /*#__PURE__*/React.createElement("pre", {
    style: {
      margin: 0,
      padding: 0,
      overflow: 'auto'
    }
  }, JSON.stringify(activeQuery.queryKey, null, 2))), /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '0.3em .6em',
      borderRadius: '0.4em',
      fontWeight: 'bold',
      textShadow: '0 2px 10px black',
      background: getQueryStatusColor({
        queryState: activeQueryState,
        isStale: isStale,
        observerCount: observerCount,
        theme
      }),
      flexShrink: 0
    }
  }, getQueryStatusLabel(activeQuery))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '.5em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, "Observers: ", /*#__PURE__*/React.createElement(Code, null, observerCount)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, "Last Updated:", ' ', /*#__PURE__*/React.createElement(Code, null, new Date(activeQueryState.dataUpdatedAt).toLocaleTimeString()))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.backgroundAlt,
      padding: '.5em',
      position: 'sticky',
      top: 0,
      zIndex: 1
    }
  }, "Actions"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0.5em'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    type: "button",
    onClick: handleRefetch,
    disabled: activeQueryState.fetchStatus === 'fetching',
    style: {
      background: theme.active
    }
  }, "Refetch"), ' ', /*#__PURE__*/React.createElement(Button, {
    type: "button",
    onClick: () => queryClient.invalidateQueries(activeQuery),
    style: {
      background: theme.warning,
      color: theme.inputTextColor
    }
  }, "Invalidate"), ' ', /*#__PURE__*/React.createElement(Button, {
    type: "button",
    onClick: () => queryClient.resetQueries(activeQuery),
    style: {
      background: theme.gray
    }
  }, "Reset"), ' ', /*#__PURE__*/React.createElement(Button, {
    type: "button",
    onClick: () => queryClient.removeQueries(activeQuery),
    style: {
      background: theme.danger
    }
  }, "Remove")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.backgroundAlt,
      padding: '.5em',
      position: 'sticky',
      top: 0,
      zIndex: 1
    }
  }, "Data Explorer"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '.5em'
    }
  }, /*#__PURE__*/React.createElement(Explorer, {
    label: "Data",
    value: activeQueryState.data,
    defaultExpanded: {}
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.backgroundAlt,
      padding: '.5em',
      position: 'sticky',
      top: 0,
      zIndex: 1
    }
  }, "Query Explorer"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '.5em'
    }
  }, /*#__PURE__*/React.createElement(Explorer, {
    label: "Query",
    value: activeQuery,
    defaultExpanded: {
      queryKey: true
    }
  })));
};

const QueryStatusCount = ({
  queryCache
}) => {
  const hasFresh = useSubscribeToQueryCache(queryCache, () => queryCache.getAll().filter(q => getQueryStatusLabel(q) === 'fresh').length);
  const hasFetching = useSubscribeToQueryCache(queryCache, () => queryCache.getAll().filter(q => getQueryStatusLabel(q) === 'fetching').length);
  const hasPaused = useSubscribeToQueryCache(queryCache, () => queryCache.getAll().filter(q => getQueryStatusLabel(q) === 'paused').length);
  const hasStale = useSubscribeToQueryCache(queryCache, () => queryCache.getAll().filter(q => getQueryStatusLabel(q) === 'stale').length);
  const hasInactive = useSubscribeToQueryCache(queryCache, () => queryCache.getAll().filter(q => getQueryStatusLabel(q) === 'inactive').length);
  return /*#__PURE__*/React.createElement(QueryKeys, {
    style: {
      marginBottom: '.5em'
    }
  }, /*#__PURE__*/React.createElement(QueryKey, {
    style: {
      background: theme.success,
      opacity: hasFresh ? 1 : 0.3
    }
  }, "fresh ", /*#__PURE__*/React.createElement(Code, null, "(", hasFresh, ")")), ' ', /*#__PURE__*/React.createElement(QueryKey, {
    style: {
      background: theme.active,
      opacity: hasFetching ? 1 : 0.3
    }
  }, "fetching ", /*#__PURE__*/React.createElement(Code, null, "(", hasFetching, ")")), ' ', /*#__PURE__*/React.createElement(QueryKey, {
    style: {
      background: theme.paused,
      opacity: hasPaused ? 1 : 0.3
    }
  }, "paused ", /*#__PURE__*/React.createElement(Code, null, "(", hasPaused, ")")), ' ', /*#__PURE__*/React.createElement(QueryKey, {
    style: {
      background: theme.warning,
      color: 'black',
      textShadow: '0',
      opacity: hasStale ? 1 : 0.3
    }
  }, "stale ", /*#__PURE__*/React.createElement(Code, null, "(", hasStale, ")")), ' ', /*#__PURE__*/React.createElement(QueryKey, {
    style: {
      background: theme.gray,
      opacity: hasInactive ? 1 : 0.3
    }
  }, "inactive ", /*#__PURE__*/React.createElement(Code, null, "(", hasInactive, ")")));
};

const QueryRow = ({
  queryKey,
  setActiveQueryHash,
  activeQueryHash,
  queryCache
}) => {
  var _useSubscribeToQueryC3, _useSubscribeToQueryC4, _useSubscribeToQueryC5, _useSubscribeToQueryC6;

  const queryHash = (_useSubscribeToQueryC3 = useSubscribeToQueryCache(queryCache, () => {
    var _queryCache$find;

    return (_queryCache$find = queryCache.find(queryKey)) == null ? void 0 : _queryCache$find.queryHash;
  })) != null ? _useSubscribeToQueryC3 : '';
  const queryState = useSubscribeToQueryCache(queryCache, () => {
    var _queryCache$find2;

    return (_queryCache$find2 = queryCache.find(queryKey)) == null ? void 0 : _queryCache$find2.state;
  });
  const isStale = (_useSubscribeToQueryC4 = useSubscribeToQueryCache(queryCache, () => {
    var _queryCache$find3;

    return (_queryCache$find3 = queryCache.find(queryKey)) == null ? void 0 : _queryCache$find3.isStale();
  })) != null ? _useSubscribeToQueryC4 : false;
  const isDisabled = (_useSubscribeToQueryC5 = useSubscribeToQueryCache(queryCache, () => {
    var _queryCache$find4;

    return (_queryCache$find4 = queryCache.find(queryKey)) == null ? void 0 : _queryCache$find4.isDisabled();
  })) != null ? _useSubscribeToQueryC5 : false;
  const observerCount = (_useSubscribeToQueryC6 = useSubscribeToQueryCache(queryCache, () => {
    var _queryCache$find5;

    return (_queryCache$find5 = queryCache.find(queryKey)) == null ? void 0 : _queryCache$find5.getObserversCount();
  })) != null ? _useSubscribeToQueryC6 : 0;

  if (!queryState) {
    return null;
  }

  return /*#__PURE__*/React.createElement("div", {
    role: "button",
    "aria-label": "Open query details for " + queryHash,
    onClick: () => setActiveQueryHash(activeQueryHash === queryHash ? '' : queryHash),
    style: {
      display: 'flex',
      borderBottom: "solid 1px " + theme.grayAlt,
      cursor: 'pointer',
      background: queryHash === activeQueryHash ? 'rgba(255,255,255,.1)' : undefined
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      width: '2em',
      height: '2em',
      background: getQueryStatusColor({
        queryState,
        isStale,
        observerCount,
        theme
      }),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      textShadow: isStale ? '0' : '0 0 10px black',
      color: isStale ? 'black' : 'white'
    }
  }, observerCount), isDisabled ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: '2em',
      background: theme.gray,
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold',
      padding: '0 0.5em'
    }
  }, "disabled") : null, /*#__PURE__*/React.createElement(Code, {
    style: {
      padding: '.5em'
    }
  }, "" + queryHash));
};