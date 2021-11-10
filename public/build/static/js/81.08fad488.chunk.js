(this["webpackJsonpvuexy-react-admin-dashboard"]=this["webpackJsonpvuexy-react-admin-dashboard"]||[]).push([[81],{1180:function(e,a,t){"use strict";var n=t(5),s=t(6),o=t(34),r=t(0),c=t.n(r),l=t(1),i=t.n(l),m=t(4),u=t.n(m),d=t(3),g=t(43);function p(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);a&&(n=n.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,n)}return t}function T(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?p(Object(t),!0).forEach((function(a){Object(o.a)(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}var h={children:i.a.node,className:i.a.string,cssModule:i.a.object,fade:i.a.bool,isOpen:i.a.bool,tag:d.tagPropType,transition:i.a.shape(g.a.propTypes),innerRef:i.a.oneOfType([i.a.object,i.a.string,i.a.func])},E={isOpen:!0,tag:"div",fade:!0,transition:T(T({},g.a.defaultProps),{},{unmountOnExit:!0})};function y(e){var a=e.className,t=e.cssModule,o=e.tag,r=e.isOpen,l=e.children,i=e.transition,m=e.fade,p=e.innerRef,h=Object(s.a)(e,["className","cssModule","tag","isOpen","children","transition","fade","innerRef"]),E=Object(d.mapToCssModules)(u()(a,"toast"),t),y=T(T(T({},g.a.defaultProps),i),{},{baseClass:m?i.baseClass:"",timeout:m?i.timeout:0});return c.a.createElement(g.a,Object(n.a)({},h,y,{tag:o,className:E,in:r,role:"alert",innerRef:p}),l)}y.propTypes=h,y.defaultProps=E,a.a=y},1181:function(e,a,t){"use strict";var n=t(5),s=t(6),o=t(0),r=t.n(o),c=t(1),l=t.n(c),i=t(4),m=t.n(i),u=t(3),d={tag:u.tagPropType,className:l.a.string,cssModule:l.a.object,innerRef:l.a.oneOfType([l.a.object,l.a.string,l.a.func])},g=function(e){var a=e.className,t=e.cssModule,o=e.innerRef,c=e.tag,l=Object(s.a)(e,["className","cssModule","innerRef","tag"]),i=Object(u.mapToCssModules)(m()(a,"toast-body"),t);return r.a.createElement(c,Object(n.a)({},l,{className:i,ref:o}))};g.propTypes=d,g.defaultProps={tag:"div"},a.a=g},1306:function(e,a,t){"use strict";var n=t(5),s=t(6),o=t(0),r=t.n(o),c=t(1),l=t.n(c),i=t(4),m=t.n(i),u=t(3),d={tag:u.tagPropType,icon:l.a.oneOfType([l.a.string,l.a.node]),wrapTag:u.tagPropType,toggle:l.a.func,className:l.a.string,cssModule:l.a.object,children:l.a.node,closeAriaLabel:l.a.string,charCode:l.a.oneOfType([l.a.string,l.a.number]),close:l.a.object},g=function(e){var a,t,o=e.className,c=e.cssModule,l=e.children,i=e.toggle,d=e.tag,g=e.wrapTag,p=e.closeAriaLabel,T=e.charCode,h=e.close,E=e.tagClassName,y=e.icon,b=Object(s.a)(e,["className","cssModule","children","toggle","tag","wrapTag","closeAriaLabel","charCode","close","tagClassName","icon"]),f=Object(u.mapToCssModules)(m()(o,"toast-header"),c);if(!h&&i){var v="number"===typeof T?String.fromCharCode(T):T;a=r.a.createElement("button",{type:"button",onClick:i,className:Object(u.mapToCssModules)("close",c),"aria-label":p},r.a.createElement("span",{"aria-hidden":"true"},v))}return"string"===typeof y?t=r.a.createElement("svg",{className:Object(u.mapToCssModules)("rounded text-"+y),width:"20",height:"20",xmlns:"http://www.w3.org/2000/svg",preserveAspectRatio:"xMidYMid slice",focusable:"false",role:"img"},r.a.createElement("rect",{fill:"currentColor",width:"100%",height:"100%"})):y&&(t=y),r.a.createElement(g,Object(n.a)({},b,{className:f}),t,r.a.createElement(d,{className:Object(u.mapToCssModules)(m()(E,{"ml-2":null!=t}),c)},l),h||a)};g.propTypes=d,g.defaultProps={tag:"strong",wrapTag:"div",tagClassName:"mr-auto",closeAriaLabel:"Close",charCode:215},a.a=g},1838:function(e,a,t){e.exports=t.p+"static/media/transparent.89267f25.svg"},2340:function(e,a,t){"use strict";t.r(a);var n=t(13),s=t(14),o=t(16),r=t(15),c=t(0),l=t.n(c),i=t(493),m=t(72),u=t(810),d=t(1375),g=t(1376),p=t(1377),T=t(1385),h=t(800),E=t(801),y=t(1378),b=t(1386),f=t(1388),v=t(1180),k=t(1306),C=t(1181),w=t(4),j=t.n(w),x=t(327),N=t(301),O=l.a.createElement("pre",null,l.a.createElement("code",{className:"language-jsx"},'\nimport React from "react"\nimport {Toast, ToastHeader, ToastBody} from "reactstrap"\nimport transparentBg from "../../../assets/img/svg/transparent.svg"\n\nclass ToastTransclucent extends React.Component {\n\n  render() {\n    return(\n      <Row>\n        <Col md="6" sm="12">\n          <div className="p-3 my-2 rounded">\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on a white background \u2014 check it out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n        <Col md="6" sm="12">\n          <div className="p-3 my-2 rounded bg-docs-transparent-grid">\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on a gridded background \u2014 check it\n                out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n        <Col md="6" sm="12">\n          <div className="p-3 bg-primary my-2 rounded">\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on a primary background \u2014 check it\n                out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n        <Col md="6" sm="12">\n          <div className="p-3 bg-secondary my-2 rounded">\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on a secondary background \u2014 check it\n                out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n        <Col md="6" sm="12">\n          <div className="p-3 bg-success my-2 rounded">\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on a success background \u2014 check it\n                out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n        <Col md="6" sm="12">\n          <div className="p-3 bg-danger my-2 rounded">\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on a danger background \u2014 check it out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n        <Col md="6" sm="12">\n          <div className="p-3 bg-warning my-2 rounded">\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on a warning background \u2014 check it\n                out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n        <Col md="6" sm="12">\n          <div className="p-3 bg-info my-2 rounded">\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on an info background \u2014 check it out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n\n        <Col md="6" sm="12">\n          <div className="p-3 bg-dark my-2 rounded">\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on an dark background \u2014 check it out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n\n        <Col md="6" sm="12">\n          <div\n            className="p-3 my-2 rounded"\n            style={{\n              background: url({transparentBg})\n            }}\n          >\n            <Toast>\n              <ToastHeader>Reactstrap</ToastHeader>\n              <ToastBody>\n                This is a toast on an transparent background \u2014 check it out!\n              </ToastBody>\n            </Toast>\n          </div>\n        </Col>\n      </Row>\n    )\n  }\n}\nexport default ToastTransclucent\n')),B=l.a.createElement("pre",null,l.a.createElement("code",{className:"language-jsx"},'\nimport React from "react"\nimport {Toast, ToastHeader, ToastBody} from "reactstrap"\n\nstate={\n  show : false\n}\n\ntoggleToast = () => {\n  this.setState({\n    show: !this.state.show\n  })\n}\n\nclass ToastBasic extends React.Component {\n\n  render() {\n    return(\n      <Button color="primary" onClick={this.toggleToast}>\n      Launch Toast\n      </Button>\n\n      <Toast isOpen={this.state.show}>\n        <ToastHeader toggle={this.toggle}>Toast title</ToastHeader>\n        <ToastBody>\n          Lorem ipsum dolor sit amet, consectetur adipisicing elit,\n          sed do eiusmod tempor incididunt ut labore et dolore magna\n          aliqua. Ut enim ad minim veniam, quis nostrud exercitation\n          ullamco laboris nisi ut aliquip ex ea commodo consequat.\n          Duis aute irure dolor in reprehenderit in voluptate velit\n          esse cillum dolore eu fugiat nulla pariatur. Excepteur sint\n          occaecat cupidatat non proident, sunt in culpa qui officia\n          deserunt mollit anim id est laborum.\n        </ToastBody>\n      </Toast>\n    )\n  }\n}\nexport default ToastBasic\n')),H=l.a.createElement("pre",null,l.a.createElement("code",{className:"language-jsx"},'\nimport React from "react"\nimport {Toast, ToastHeader, ToastBody} from "reactstrap"\nimport logo from "../../../assets/img/logo/logo.png"\n\n\nclass ToastHeaderIcons extends React.Component {\n\n  render() {\n    return(\n      <Row>\n        <Col md="6" sm="12">\n          <Toast>\n            <ToastHeader icon="primary">Vuexy</ToastHeader>\n            <ToastBody>\n              This is a toast with a primary icon \u2014 check it out!\n            </ToastBody>\n          </Toast>\n        </Col>\n        <Col md="6" sm="12">\n          <Toast>\n            <ToastHeader icon="success">Vuexy</ToastHeader>\n            <ToastBody>\n              This is a toast with a success icon \u2014 check it out!\n            </ToastBody>\n          </Toast>\n        </Col>\n        <Col md="6" sm="12">\n          <Toast>\n            <ToastHeader icon="info">Vuexy</ToastHeader>\n            <ToastBody>\n              This is a toast with a info icon \u2014 check it out!\n            </ToastBody>\n          </Toast>\n        </Col>\n        <Col md="6" sm="12">\n          <Toast>\n            <ToastHeader icon="danger">Vuexy</ToastHeader>\n            <ToastBody>\n              This is a toast with a danger icon \u2014 check it out!\n            </ToastBody>\n          </Toast>\n        </Col>\n        <Col md="6" sm="12">\n          <Toast>\n            <ToastHeader icon="warning">Vuexy</ToastHeader>\n            <ToastBody>\n              This is a toast with a warning icon \u2014 check it out!\n            </ToastBody>\n          </Toast>\n        </Col>\n        <Col md="6" sm="12">\n          <Toast>\n            <ToastHeader icon="dark">Vuexy</ToastHeader>\n            <ToastBody>\n              This is a toast with a dark icon \u2014 check it out!\n            </ToastBody>\n          </Toast>\n        </Col>\n\n        <Col md="6" sm="12">\n          <Toast>\n            <ToastHeader icon={<Spinner size="sm" color="primary" />}>\n              Vuexy\n            </ToastHeader>\n            <ToastBody>\n              This is a toast with a spinner \u2014 check it out!\n            </ToastBody>\n          </Toast>\n        </Col>\n\n        <Col md="6" sm="12">\n          <Toast>\n            <ToastHeader>\n              <img src={logo} alt="logo" className="mr-1" />\n              Vuexy\n            </ToastHeader>\n            <ToastBody>\n              This is a toast with a logo \u2014 check it out!\n            </ToastBody>\n          </Toast>\n      </Col>\n      </Row>\n    )\n  }\n}\nexport default ToastHeaderIcons\n')),R=t(1838),P=t.n(R),S=function(e){Object(o.a)(t,e);var a=Object(r.a)(t);function t(){var e;Object(n.a)(this,t);for(var s=arguments.length,o=new Array(s),r=0;r<s;r++)o[r]=arguments[r];return(e=a.call.apply(a,[this].concat(o))).state={activeTab:"1"},e.toggleTab=function(a){e.state.activeTab!==a&&e.setState({activeTab:a})},e}return Object(s.a)(t,[{key:"render",value:function(){var e=this;return l.a.createElement(l.a.Fragment,null,l.a.createElement(d.a,null,l.a.createElement(g.a,null,l.a.createElement(p.a,null,"Toasts Translucent"),l.a.createElement("div",{className:"views"},l.a.createElement(T.a,{tabs:!0},l.a.createElement(h.a,null,l.a.createElement(E.a,{className:j()({active:"1"===this.state.activeTab}),onClick:function(){e.toggleTab("1")}},l.a.createElement(x.a,{size:15}))),l.a.createElement(h.a,null,l.a.createElement(E.a,{className:j()({active:"2"===this.state.activeTab}),onClick:function(){e.toggleTab("2")}},l.a.createElement(N.a,{size:15})))))),l.a.createElement(y.a,null,l.a.createElement("p",null,"Toasts are slightly translucent, too, so they blend over whatever they might appear over. For browsers that support the backdrop-filter CSS property, we\u2019ll also attempt to blur the elements under a toast."),l.a.createElement(b.a,{activeTab:this.state.activeTab},l.a.createElement(f.a,{tabId:"1"},l.a.createElement(i.a,null,l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement("div",{className:"p-3 bg-primary my-2 rounded"},l.a.createElement(v.a,null,l.a.createElement(k.a,null,"Vuexy"),l.a.createElement(C.a,null,"This is a toast on a primary background \u2014 check it out!")))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement("div",{className:"p-3 bg-secondary my-2 rounded"},l.a.createElement(v.a,null,l.a.createElement(k.a,null,"Vuexy"),l.a.createElement(C.a,null,"This is a toast on a secondary background \u2014 check it out!")))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement("div",{className:"p-3 bg-success my-2 rounded"},l.a.createElement(v.a,null,l.a.createElement(k.a,null,"Vuexy"),l.a.createElement(C.a,null,"This is a toast on a success background \u2014 check it out!")))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement("div",{className:"p-3 bg-danger my-2 rounded"},l.a.createElement(v.a,null,l.a.createElement(k.a,null,"Vuexy"),l.a.createElement(C.a,null,"This is a toast on a danger background \u2014 check it out!")))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement("div",{className:"p-3 bg-warning my-2 rounded"},l.a.createElement(v.a,null,l.a.createElement(k.a,null,"Vuexy"),l.a.createElement(C.a,null,"This is a toast on a warning background \u2014 check it out!")))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement("div",{className:"p-3 bg-info my-2 rounded"},l.a.createElement(v.a,null,l.a.createElement(k.a,null,"Vuexy"),l.a.createElement(C.a,null,"This is a toast on an info background \u2014 check it out!")))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement("div",{className:"p-3 bg-dark my-2 rounded"},l.a.createElement(v.a,null,l.a.createElement(k.a,null,"Vuexy"),l.a.createElement(C.a,null,"This is a toast on an dark background \u2014 check it out!")))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement("div",{className:"p-3 my-2 rounded",style:{background:"url(".concat(P.a,")")}},l.a.createElement(v.a,null,l.a.createElement(k.a,null,"Vuexy"),l.a.createElement(C.a,null,"This is a toast on a transparent background \u2014 check it out!")))))),l.a.createElement(f.a,{className:"component-code",tabId:"2"},O)))))}}]),t}(l.a.Component),V=t(92),M=function(e){Object(o.a)(t,e);var a=Object(r.a)(t);function t(){var e;Object(n.a)(this,t);for(var s=arguments.length,o=new Array(s),r=0;r<s;r++)o[r]=arguments[r];return(e=a.call.apply(a,[this].concat(o))).state={activeTab:"1",show:!1},e.toggleTab=function(a){e.state.activeTab!==a&&e.setState({activeTab:a})},e.toggleToast=function(){e.setState({show:!e.state.show})},e}return Object(s.a)(t,[{key:"render",value:function(){var e=this;return l.a.createElement(l.a.Fragment,null,l.a.createElement(d.a,null,l.a.createElement(g.a,null,l.a.createElement(p.a,null,"Toast Basic"),l.a.createElement("div",{className:"views"},l.a.createElement(T.a,{tabs:!0},l.a.createElement(h.a,null,l.a.createElement(E.a,{className:j()({active:"1"===this.state.activeTab}),onClick:function(){e.toggleTab("1")}},l.a.createElement(x.a,{size:15}))),l.a.createElement(h.a,null,l.a.createElement(E.a,{className:j()({active:"2"===this.state.activeTab}),onClick:function(){e.toggleTab("2")}},l.a.createElement(N.a,{size:15})))))),l.a.createElement(y.a,null,l.a.createElement(b.a,{activeTab:this.state.activeTab},l.a.createElement(f.a,{tabId:"1"},l.a.createElement(V.a.Ripple,{color:"primary",onClick:this.toggleToast},"Launch Toast"),l.a.createElement(v.a,{isOpen:this.state.show,className:"default"},l.a.createElement(k.a,{toggle:this.toggleToast},"Toast title"),l.a.createElement(C.a,null,"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."))),l.a.createElement(f.a,{className:"component-code",tabId:"2"},B)))))}}]),t}(l.a.Component),A=t(916),z=t(107),q=t.n(z),D=function(e){Object(o.a)(t,e);var a=Object(r.a)(t);function t(){var e;Object(n.a)(this,t);for(var s=arguments.length,o=new Array(s),r=0;r<s;r++)o[r]=arguments[r];return(e=a.call.apply(a,[this].concat(o))).state={activeTab:"1"},e.toggleTab=function(a){e.state.activeTab!==a&&e.setState({activeTab:a})},e}return Object(s.a)(t,[{key:"render",value:function(){var e=this;return l.a.createElement(l.a.Fragment,null,l.a.createElement(d.a,null,l.a.createElement(g.a,null,l.a.createElement(p.a,null,"Icons"),l.a.createElement("div",{className:"views"},l.a.createElement(T.a,{tabs:!0},l.a.createElement(h.a,null,l.a.createElement(E.a,{className:j()({active:"1"===this.state.activeTab}),onClick:function(){e.toggleTab("1")}},l.a.createElement(x.a,{size:15}))),l.a.createElement(h.a,null,l.a.createElement(E.a,{className:j()({active:"2"===this.state.activeTab}),onClick:function(){e.toggleTab("2")}},l.a.createElement(N.a,{size:15})))))),l.a.createElement(y.a,null,l.a.createElement("p",null,"Use ",l.a.createElement("code",null,"icon")," attribute with ",l.a.createElement("code",null,"ToastHeader")," tag to add an icon."),l.a.createElement(b.a,{activeTab:this.state.activeTab},l.a.createElement(f.a,{tabId:"1"},l.a.createElement(i.a,null,l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement(v.a,null,l.a.createElement(k.a,{icon:"primary"},"Vuexy"),l.a.createElement(C.a,null,"This is a toast with a primary icon \u2014 check it out!"))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement(v.a,null,l.a.createElement(k.a,{icon:"success"},"Vuexy"),l.a.createElement(C.a,null,"This is a toast with a success icon \u2014 check it out!"))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement(v.a,null,l.a.createElement(k.a,{icon:"info"},"Vuexy"),l.a.createElement(C.a,null,"This is a toast with a info icon \u2014 check it out!"))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement(v.a,null,l.a.createElement(k.a,{icon:"danger"},"Vuexy"),l.a.createElement(C.a,null,"This is a toast with a danger icon \u2014 check it out!"))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement(v.a,null,l.a.createElement(k.a,{icon:"warning"},"Vuexy"),l.a.createElement(C.a,null,"This is a toast with a warning icon \u2014 check it out!"))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement(v.a,null,l.a.createElement(k.a,{icon:"dark"},"Vuexy"),l.a.createElement(C.a,null,"This is a toast with a dark icon \u2014 check it out!"))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement(v.a,null,l.a.createElement(k.a,{icon:l.a.createElement(A.a,{size:"sm",color:"primary"})},"Vuexy"),l.a.createElement(C.a,null,"This is a toast with a spinner \u2014 check it out!"))),l.a.createElement(m.a,{md:"6",sm:"12"},l.a.createElement(v.a,null,l.a.createElement(k.a,null,l.a.createElement("img",{src:q.a,alt:"logo",className:"mr-1"}),"Vuexy"),l.a.createElement(C.a,null,"This is a toast with a logo \u2014 check it out!"))))),l.a.createElement(f.a,{className:"component-code",tabId:"2"},H)))))}}]),t}(l.a.Component),I=t(817),L=t.n(I),F=(t(815),function(e){Object(o.a)(t,e);var a=Object(r.a)(t);function t(){return Object(n.a)(this,t),a.apply(this,arguments)}return Object(s.a)(t,[{key:"componentDidMount",value:function(){L.a.highlightAll()}},{key:"render",value:function(){return l.a.createElement(l.a.Fragment,null,l.a.createElement(u.a,{breadCrumbTitle:"Toasts",breadCrumbParent:"Components",breadCrumbActive:"Toasts"}),l.a.createElement(i.a,null,l.a.createElement(m.a,{sm:"12"},l.a.createElement(S,null)),l.a.createElement(m.a,{sm:"12"},l.a.createElement(D,null)),l.a.createElement(m.a,{sm:"12"},l.a.createElement(M,null))))}}]),t}(l.a.Component));a.default=F},815:function(e,a){!function(e){var a=e.util.clone(e.languages.javascript),t="(?:\\{<S>*\\.{3}(?:[^{}]|<BRACES>)*\\})";function n(e,a){return e=e.replace(/<S>/g,(function(){return"(?:\\s|//.*(?!.)|/\\*(?:[^*]|\\*(?!/))\\*/)"})).replace(/<BRACES>/g,(function(){return"(?:\\{(?:\\{(?:\\{[^{}]*\\}|[^{}])*\\}|[^{}])*\\})"})).replace(/<SPREAD>/g,(function(){return t})),RegExp(e,a)}t=n(t).source,e.languages.jsx=e.languages.extend("markup",a),e.languages.jsx.tag.pattern=n("</?(?:[\\w.:-]+(?:<S>+(?:[\\w.:$-]+(?:=(?:\"(?:\\\\[^]|[^\\\\\"])*\"|'(?:\\\\[^]|[^\\\\'])*'|[^\\s{'\"/>=]+|<BRACES>))?|<SPREAD>))*<S>*/?)?>"),e.languages.jsx.tag.inside.tag.pattern=/^<\/?[^\s>\/]*/i,e.languages.jsx.tag.inside["attr-value"].pattern=/=(?!\{)(?:"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|[^\s'">]+)/i,e.languages.jsx.tag.inside.tag.inside["class-name"]=/^[A-Z]\w*(?:\.[A-Z]\w*)*$/,e.languages.jsx.tag.inside.comment=a.comment,e.languages.insertBefore("inside","attr-name",{spread:{pattern:n("<SPREAD>"),inside:e.languages.jsx}},e.languages.jsx.tag),e.languages.insertBefore("inside","special-attr",{script:{pattern:n("=<BRACES>"),inside:{"script-punctuation":{pattern:/^=(?=\{)/,alias:"punctuation"},rest:e.languages.jsx},alias:"language-javascript"}},e.languages.jsx.tag);var s=function e(a){return a?"string"==typeof a?a:"string"==typeof a.content?a.content:a.content.map(e).join(""):""};e.hooks.add("after-tokenize",(function(a){"jsx"!==a.language&&"tsx"!==a.language||function a(t){for(var n=[],o=0;o<t.length;o++){var r=t[o],c=!1;if("string"!=typeof r&&("tag"===r.type&&r.content[0]&&"tag"===r.content[0].type?"</"===r.content[0].content[0].content?0<n.length&&n[n.length-1].tagName===s(r.content[0].content[1])&&n.pop():"/>"===r.content[r.content.length-1].content||n.push({tagName:s(r.content[0].content[1]),openedBraces:0}):0<n.length&&"punctuation"===r.type&&"{"===r.content?n[n.length-1].openedBraces++:0<n.length&&0<n[n.length-1].openedBraces&&"punctuation"===r.type&&"}"===r.content?n[n.length-1].openedBraces--:c=!0),(c||"string"==typeof r)&&0<n.length&&0===n[n.length-1].openedBraces){var l=s(r);o<t.length-1&&("string"==typeof t[o+1]||"plain-text"===t[o+1].type)&&(l+=s(t[o+1]),t.splice(o+1,1)),0<o&&("string"==typeof t[o-1]||"plain-text"===t[o-1].type)&&(l=s(t[o-1])+l,t.splice(o-1,1),o--),t[o]=new e.Token("plain-text",l,null,l)}r.content&&"string"!=typeof r.content&&a(r.content)}}(a.tokens)}))}(Prism)},916:function(e,a,t){"use strict";var n=t(5),s=t(6),o=t(0),r=t.n(o),c=t(1),l=t.n(c),i=t(4),m=t.n(i),u=t(3),d={tag:u.tagPropType,type:l.a.string,size:l.a.string,color:l.a.string,className:l.a.string,cssModule:l.a.object,children:l.a.string},g=function(e){var a=e.className,t=e.cssModule,o=e.type,c=e.size,l=e.color,i=e.children,d=e.tag,g=Object(s.a)(e,["className","cssModule","type","size","color","children","tag"]),p=Object(u.mapToCssModules)(m()(a,!!c&&"spinner-"+o+"-"+c,"spinner-"+o,!!l&&"text-"+l),t);return r.a.createElement(d,Object(n.a)({role:"status"},g,{className:p}),i&&r.a.createElement("span",{className:Object(u.mapToCssModules)("sr-only",t)},i))};g.propTypes=d,g.defaultProps={tag:"div",type:"border",children:"Loading..."},a.a=g}}]);
//# sourceMappingURL=81.08fad488.chunk.js.map