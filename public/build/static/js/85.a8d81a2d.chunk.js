(this["webpackJsonpvuexy-react-admin-dashboard"]=this["webpackJsonpvuexy-react-admin-dashboard"]||[]).push([[85],{2343:function(e,t,a){"use strict";a.r(t);var n=a(13),r=a(14),i=a(16),l=a(15),o=a(0),c=a.n(o),s=a(493),m=a(72),u=a(1375),d=a(1378),p=a(810),f=a(1376),E=a(1377),g=a(832),b=a(339),h=a(338),y=a(585),v=a(581),O=a(582),j=(a(4),a(223)),x=a(820),T=a(816),D=a(1384),N=a(818),S=a(92),z=function(e){Object(i.a)(a,e);var t=Object(l.a)(a);function a(){return Object(n.a)(this,a),t.apply(this,arguments)}return Object(r.a)(a,[{key:"render",value:function(){return c.a.createElement(u.a,null,c.a.createElement(d.a,null,c.a.createElement(x.a,{className:"mt-10"},c.a.createElement(s.a,null,c.a.createElement(m.a,{sm:"12"},c.a.createElement(T.a,{className:"form-label-group"},c.a.createElement(D.a,{type:"text",name:"fullname",id:"nameFloating",placeholder:"Folder Name"}),c.a.createElement(N.a,{for:"nameFloating"},"Add Folder Name"))),c.a.createElement(m.a,{sm:"12"},c.a.createElement(T.a,{className:"form-label-group"},c.a.createElement(S.a.Ripple,{color:"primary",type:"submit",className:"mr-1 mb-1",onClick:function(e){return e.preventDefault()}},"Save")))))))}}]),a}(c.a.Component),k=function(e){Object(i.a)(a,e);var t=Object(l.a)(a);function a(){var e;Object(n.a)(this,a);for(var r=arguments.length,i=new Array(r),l=0;l<r;l++)i[l]=arguments[l];return(e=t.call.apply(t,[this].concat(i))).state={activeTab:"1",modal:!1},e.toggleTab=function(t){e.state.activeTab!==t&&e.setState({activeTab:t})},e.toggleModal=function(){e.setState((function(e){return{modal:!e.modal}}))},e}return Object(r.a)(a,[{key:"render",value:function(){return c.a.createElement(c.a.Fragment,null,c.a.createElement("div",{onClick:this.toggleModal},c.a.createElement(j.a,{size:"18"}),"Add Folder"),c.a.createElement(y.a,{isOpen:this.state.modal,toggle:this.toggleModal,className:"modal-dialog-centered"},c.a.createElement(v.a,{toggle:this.toggleModal},"Add Folder Name"),c.a.createElement(O.a,null,c.a.createElement(z,null))))}}]),a}(c.a.Component),C=[{id:1,title:"Lead",content:c.a.createElement(c.a.Fragment,null,c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),c.a.createElement("a",{href:"/email/inbox"}," upon entry ")," "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"SDFDSFDSF "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(k,null)," "))},{id:2,title:"Active Trial",content:c.a.createElement(c.a.Fragment,null,c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),c.a.createElement("a",{href:"/email/inbox"}," upon entry ")," "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"SDFDSFDSF "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "))},{id:3,title:"Former Trial",content:c.a.createElement(c.a.Fragment,null,c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),c.a.createElement("a",{href:"/email/inbox"}," upon entry ")," "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"SDFDSFDSF "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "))},{id:4,title:"Former Student",content:c.a.createElement(c.a.Fragment,null,c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),c.a.createElement("a",{href:"/email/inbox"}," upon entry ")," "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"SDFDSFDSF "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "),c.a.createElement("div",{style:{marginLeft:"10px"}},c.a.createElement(b.a,{size:"10"}),"Demo "))},{id:5,title:"Draft"}],F=function(e){Object(i.a)(a,e);var t=Object(l.a)(a);function a(){var e;Object(n.a)(this,a);for(var r=arguments.length,i=new Array(r),l=0;l<r;l++)i[l]=arguments[l];return(e=t.call.apply(t,[this].concat(i))).state={collapseID:""},e.toggleCollapse=function(t){e.setState((function(e){return{collapseID:e.collapseID!==t?t:""}}))},e}return Object(r.a)(a,[{key:"render",value:function(){var e=this,t=C.map((function(t){return c.a.createElement(u.a,{key:t.id,onClick:function(){return e.toggleCollapse(t.id)}},c.a.createElement(f.a,null,c.a.createElement(E.a,{className:"lead collapse-title collapsed"},c.a.createElement(h.a,{size:"18"}),t.title)),c.a.createElement(g.a,{isOpen:t.id===e.state.collapseID,onEntering:e.onEntering,onEntered:e.onEntered,onExiting:e.onExiting,onExited:e.onExited},c.a.createElement(d.a,null,t.content)))}));return c.a.createElement("div",{className:"collapse-bordered vx-collapse collapse-icon accordion-icon-rotate"},t)}}]),a}(c.a.Component),w=(a(917),a(56)),M=a(1379),P=a(1380),L=a(806),R=a(104),A=[{id:"1",name:"Mary S. Navarre",content:"Chupa chups tiramisu apple pie biscuit sweet roll bonbon macaroon toffee icing."},{id:"2",name:"Samuel M. Ellis",content:"Toffee powder marzipan tiramisu. Cake cake dessert danish."},{id:"3",name:"Sandra C. Toney",content:"Sugar plum fruitcake gummies marzipan liquorice tiramisu. Pastry liquorice chupa chupsake."},{id:"4",name:"Cleveland C. Goins",content:"Toffee powder marzipan tiramisu. Cake cake dessert danish."},{id:"5",name:"Linda M. English",content:"Chupa chups tiramisu apple pie biscuit sweet roll bonbon macaroon toffee icing."}],I=function(e){return A.map((function(e){return{id:e.id,content:e.content,name:e.name}}))},G=function(e,t,a){var n=Array.from(e),r=n.splice(t,1),i=Object(w.a)(r,1)[0];return n.splice(a,0,i),n},H=function(e){Object(i.a)(a,e);var t=Object(l.a)(a);function a(){var e;Object(n.a)(this,a);for(var r=arguments.length,i=new Array(r),l=0;l<r;l++)i[l]=arguments[l];return(e=t.call.apply(t,[this].concat(i))).state={items:I()},e.onDragEnd=function(t){if(t.destination){var a=G(e.state.items,t.source.index,t.destination.index);e.setState({items:a})}},e}return Object(r.a)(a,[{key:"render",value:function(){var e=this;return c.a.createElement(c.a.Fragment,null,c.a.createElement("h6",null,"Drag and drop messages to change their order."),c.a.createElement(M.a,{id:"list-group-dnd"},c.a.createElement(R.a,{onDragEnd:this.onDragEnd},c.a.createElement(R.c,{droppableId:"droppable"},(function(t,a){return c.a.createElement("div",{ref:t.innerRef},e.state.items.map((function(e,t){return c.a.createElement(R.b,{key:e.id,draggableId:e.id,index:t},(function(t,a){return c.a.createElement("div",Object.assign({ref:t.innerRef},t.draggableProps,t.dragHandleProps,{className:"drag-wrapper"}),c.a.createElement(P.a,null,c.a.createElement(L.a,null,c.a.createElement(L.a,{left:!0,tag:"div"}),c.a.createElement(L.a,{body:!0},c.a.createElement("h5",{className:"mt-0"},e.name),e.content))))}))})),t.placeholder)})))))}}]),a}(c.a.Component),q=function(e){Object(i.a)(a,e);var t=Object(l.a)(a);function a(){return Object(n.a)(this,a),t.apply(this,arguments)}return Object(r.a)(a,[{key:"render",value:function(){return c.a.createElement(c.a.Fragment,null,c.a.createElement(p.a,{breadCrumbTitle:"Nurturing",breadCrumbParent:"Pages",breadCrumbActive:"Nurturing"}),c.a.createElement(s.a,null,c.a.createElement(m.a,{sm:"3"},c.a.createElement(F,null)),c.a.createElement(m.a,{sm:"9"},c.a.createElement(u.a,null,c.a.createElement(s.a,null,c.a.createElement(d.a,{style:{background:"#eee"}},c.a.createElement("h6",null,"What is an automatic email?"),c.a.createElement("p",null,"An email put into this section will be automatically sent to anyone in your lead contacts. Emails are sent automatically based on the time your entered your lead in to CMA Planner.")))),c.a.createElement(u.a,null,c.a.createElement(d.a,null,c.a.createElement(H,null))))))}}]),a}(c.a.Component);t.default=q},816:function(e,t,a){"use strict";var n=a(5),r=a(6),i=a(0),l=a.n(i),o=a(1),c=a.n(o),s=a(4),m=a.n(s),u=a(3),d={children:c.a.node,row:c.a.bool,check:c.a.bool,inline:c.a.bool,disabled:c.a.bool,tag:u.tagPropType,className:c.a.string,cssModule:c.a.object},p=function(e){var t=e.className,a=e.cssModule,i=e.row,o=e.disabled,c=e.check,s=e.inline,d=e.tag,p=Object(r.a)(e,["className","cssModule","row","disabled","check","inline","tag"]),f=Object(u.mapToCssModules)(m()(t,!!i&&"row",c?"form-check":"form-group",!(!c||!s)&&"form-check-inline",!(!c||!o)&&"disabled"),a);return"fieldset"===d&&(p.disabled=o),l.a.createElement(d,Object(n.a)({},p,{className:f}))};p.propTypes=d,p.defaultProps={tag:"div"},t.a=p},818:function(e,t,a){"use strict";var n=a(5),r=a(6),i=a(0),l=a.n(i),o=a(1),c=a.n(o),s=a(4),m=a.n(s),u=a(3),d=c.a.oneOfType([c.a.number,c.a.string]),p=c.a.oneOfType([c.a.bool,c.a.string,c.a.number,c.a.shape({size:d,order:d,offset:d})]),f={children:c.a.node,hidden:c.a.bool,check:c.a.bool,size:c.a.string,for:c.a.string,tag:u.tagPropType,className:c.a.string,cssModule:c.a.object,xs:p,sm:p,md:p,lg:p,xl:p,widths:c.a.array},E={tag:"label",widths:["xs","sm","md","lg","xl"]},g=function(e,t,a){return!0===a||""===a?e?"col":"col-"+t:"auto"===a?e?"col-auto":"col-"+t+"-auto":e?"col-"+a:"col-"+t+"-"+a},b=function(e){var t=e.className,a=e.cssModule,i=e.hidden,o=e.widths,c=e.tag,s=e.check,d=e.size,p=e.for,f=Object(r.a)(e,["className","cssModule","hidden","widths","tag","check","size","for"]),E=[];o.forEach((function(t,n){var r=e[t];if(delete f[t],r||""===r){var i,l=!n;if(Object(u.isObject)(r)){var o,c=l?"-":"-"+t+"-";i=g(l,t,r.size),E.push(Object(u.mapToCssModules)(m()(((o={})[i]=r.size||""===r.size,o["order"+c+r.order]=r.order||0===r.order,o["offset"+c+r.offset]=r.offset||0===r.offset,o))),a)}else i=g(l,t,r),E.push(i)}}));var b=Object(u.mapToCssModules)(m()(t,!!i&&"sr-only",!!s&&"form-check-label",!!d&&"col-form-label-"+d,E,!!E.length&&"col-form-label"),a);return l.a.createElement(c,Object(n.a)({htmlFor:p},f,{className:b}))};b.propTypes=f,b.defaultProps=E,t.a=b},820:function(e,t,a){"use strict";var n=a(5),r=a(6),i=a(7),l=a(12),o=a(0),c=a.n(o),s=a(1),m=a.n(s),u=a(4),d=a.n(u),p=a(3),f={children:m.a.node,inline:m.a.bool,tag:p.tagPropType,innerRef:m.a.oneOfType([m.a.object,m.a.func,m.a.string]),className:m.a.string,cssModule:m.a.object},E=function(e){function t(t){var a;return(a=e.call(this,t)||this).getRef=a.getRef.bind(Object(i.a)(a)),a.submit=a.submit.bind(Object(i.a)(a)),a}Object(l.a)(t,e);var a=t.prototype;return a.getRef=function(e){this.props.innerRef&&this.props.innerRef(e),this.ref=e},a.submit=function(){this.ref&&this.ref.submit()},a.render=function(){var e=this.props,t=e.className,a=e.cssModule,i=e.inline,l=e.tag,o=e.innerRef,s=Object(r.a)(e,["className","cssModule","inline","tag","innerRef"]),m=Object(p.mapToCssModules)(d()(t,!!i&&"form-inline"),a);return c.a.createElement(l,Object(n.a)({},s,{ref:o,className:m}))},t}(o.Component);E.propTypes=f,E.defaultProps={tag:"form"},t.a=E},832:function(e,t,a){"use strict";var n,r=a(5),i=a(6),l=a(7),o=a(12),c=a(34),s=a(0),m=a.n(s),u=a(1),d=a.n(u),p=a(4),f=a.n(p),E=a(100),g=a(3);function b(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function h(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?b(Object(a),!0).forEach((function(t){Object(c.a)(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):b(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}var y=h(h({},E.Transition.propTypes),{},{isOpen:d.a.bool,children:d.a.oneOfType([d.a.arrayOf(d.a.node),d.a.node]),tag:g.tagPropType,className:d.a.node,navbar:d.a.bool,cssModule:d.a.object,innerRef:d.a.oneOfType([d.a.func,d.a.string,d.a.object])}),v=h(h({},E.Transition.defaultProps),{},{isOpen:!1,appear:!1,enter:!0,exit:!0,tag:"div",timeout:g.TransitionTimeouts.Collapse}),O=((n={})[g.TransitionStatuses.ENTERING]="collapsing",n[g.TransitionStatuses.ENTERED]="collapse show",n[g.TransitionStatuses.EXITING]="collapsing",n[g.TransitionStatuses.EXITED]="collapse",n);function j(e){return e.scrollHeight}var x=function(e){function t(t){var a;return(a=e.call(this,t)||this).state={height:null},["onEntering","onEntered","onExit","onExiting","onExited"].forEach((function(e){a[e]=a[e].bind(Object(l.a)(a))})),a}Object(o.a)(t,e);var a=t.prototype;return a.onEntering=function(e,t){this.setState({height:j(e)}),this.props.onEntering(e,t)},a.onEntered=function(e,t){this.setState({height:null}),this.props.onEntered(e,t)},a.onExit=function(e){this.setState({height:j(e)}),this.props.onExit(e)},a.onExiting=function(e){e.offsetHeight;this.setState({height:0}),this.props.onExiting(e)},a.onExited=function(e){this.setState({height:null}),this.props.onExited(e)},a.render=function(){var e=this,t=this.props,a=t.tag,n=t.isOpen,l=t.className,o=t.navbar,c=t.cssModule,s=t.children,u=(t.innerRef,Object(i.a)(t,["tag","isOpen","className","navbar","cssModule","children","innerRef"])),d=this.state.height,p=Object(g.pick)(u,g.TransitionPropTypeKeys),b=Object(g.omit)(u,g.TransitionPropTypeKeys);return m.a.createElement(E.Transition,Object(r.a)({},p,{in:n,onEntering:this.onEntering,onEntered:this.onEntered,onExit:this.onExit,onExiting:this.onExiting,onExited:this.onExited}),(function(t){var n=function(e){return O[e]||"collapse"}(t),i=Object(g.mapToCssModules)(f()(l,n,o&&"navbar-collapse"),c),u=null===d?null:{height:d};return m.a.createElement(a,Object(r.a)({},b,{style:h(h({},b.style),u),className:i,ref:e.props.innerRef}),s)}))},t}(s.Component);x.propTypes=y,x.defaultProps=v,t.a=x},917:function(e,t,a){}}]);
//# sourceMappingURL=85.a8d81a2d.chunk.js.map