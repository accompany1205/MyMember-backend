(this["webpackJsonpvuexy-react-admin-dashboard"]=this["webpackJsonpvuexy-react-admin-dashboard"]||[]).push([[166],{1211:function(e,a,t){"use strict";t.r(a);var l=t(13),r=t(14),n=t(16),c=t(15),o=t(0),u=t.n(o),s=t(493),m=t(72),i=t(810),d=t(1375),b=t(1376),p=t(1377),f=t(1378),h=t(1384),E=function(e){Object(n.a)(t,e);var a=Object(c.a)(t);function t(){return Object(l.a)(this,t),a.apply(this,arguments)}return Object(r.a)(t,[{key:"render",value:function(){return u.a.createElement(d.a,null,u.a.createElement(b.a,null,u.a.createElement(p.a,null,"Default")),u.a.createElement(f.a,null,u.a.createElement("p",null,"To create a Textarea use ",u.a.createElement("code",null,'type="textarea"')," with reactstrap Input tag."),u.a.createElement(h.a,{type:"textarea",name:"text",id:"exampleText",rows:"3",placeholder:"Textarea"})))}}]),t}(u.a.Component),v=t(818),g=function(e){Object(n.a)(t,e);var a=Object(c.a)(t);function t(){return Object(l.a)(this,t),a.apply(this,arguments)}return Object(r.a)(t,[{key:"render",value:function(){return u.a.createElement(d.a,null,u.a.createElement(b.a,null,u.a.createElement(p.a,null,"Floating label")),u.a.createElement(f.a,null,u.a.createElement("p",null,"Use ",u.a.createElement("code",null,".form-label-group")," as a wrapper to add a Floating Label with Textarea"),u.a.createElement("div",{className:"form-label-group mt-2"},u.a.createElement(h.a,{type:"textarea",name:"text",id:"exampleText",rows:"3",placeholder:"Floating Label"}),u.a.createElement(v.a,null,"Floating Label"))))}}]),t}(u.a.Component),x=function(e){Object(n.a)(t,e);var a=Object(c.a)(t);function t(){var e;Object(l.a)(this,t);for(var r=arguments.length,n=new Array(r),c=0;c<r;c++)n[c]=arguments[c];return(e=a.call.apply(a,[this].concat(n))).state={value:""},e}return Object(r.a)(t,[{key:"render",value:function(){var e=this;return u.a.createElement(d.a,null,u.a.createElement(b.a,null,u.a.createElement(p.a,null,"Counter")),u.a.createElement(f.a,null,u.a.createElement("div",{className:"form-label-group mt-2 mb-0"},u.a.createElement(h.a,{type:"textarea",name:"text",id:"exampleText",rows:"3",value:this.state.value,placeholder:"Counter",onChange:function(a){return e.setState({value:a.target.value})}}),u.a.createElement(v.a,null,"Counter")),u.a.createElement("small",{className:"counter-value float-right ".concat(this.state.value.length>20?"bg-danger":"")},"".concat(this.state.value.length,"/20"))))}}]),t}(u.a.Component),O=function(e){Object(n.a)(t,e);var a=Object(c.a)(t);function t(){return Object(l.a)(this,t),a.apply(this,arguments)}return Object(r.a)(t,[{key:"render",value:function(){return u.a.createElement(u.a.Fragment,null,u.a.createElement(i.a,{breadCrumbTitle:"Textarea",breadCrumbParent:"Form Elements",breadCrumbActive:"Textarea"}),u.a.createElement(s.a,null,u.a.createElement(m.a,{sm:"12"},u.a.createElement(E,null)),u.a.createElement(m.a,{sm:"12"},u.a.createElement(g,null)),u.a.createElement(m.a,{sm:"12"},u.a.createElement(x,null))))}}]),t}(u.a.Component);a.default=O},818:function(e,a,t){"use strict";var l=t(5),r=t(6),n=t(0),c=t.n(n),o=t(1),u=t.n(o),s=t(4),m=t.n(s),i=t(3),d=u.a.oneOfType([u.a.number,u.a.string]),b=u.a.oneOfType([u.a.bool,u.a.string,u.a.number,u.a.shape({size:d,order:d,offset:d})]),p={children:u.a.node,hidden:u.a.bool,check:u.a.bool,size:u.a.string,for:u.a.string,tag:i.tagPropType,className:u.a.string,cssModule:u.a.object,xs:b,sm:b,md:b,lg:b,xl:b,widths:u.a.array},f={tag:"label",widths:["xs","sm","md","lg","xl"]},h=function(e,a,t){return!0===t||""===t?e?"col":"col-"+a:"auto"===t?e?"col-auto":"col-"+a+"-auto":e?"col-"+t:"col-"+a+"-"+t},E=function(e){var a=e.className,t=e.cssModule,n=e.hidden,o=e.widths,u=e.tag,s=e.check,d=e.size,b=e.for,p=Object(r.a)(e,["className","cssModule","hidden","widths","tag","check","size","for"]),f=[];o.forEach((function(a,l){var r=e[a];if(delete p[a],r||""===r){var n,c=!l;if(Object(i.isObject)(r)){var o,u=c?"-":"-"+a+"-";n=h(c,a,r.size),f.push(Object(i.mapToCssModules)(m()(((o={})[n]=r.size||""===r.size,o["order"+u+r.order]=r.order||0===r.order,o["offset"+u+r.offset]=r.offset||0===r.offset,o))),t)}else n=h(c,a,r),f.push(n)}}));var E=Object(i.mapToCssModules)(m()(a,!!n&&"sr-only",!!s&&"form-check-label",!!d&&"col-form-label-"+d,f,!!f.length&&"col-form-label"),t);return c.a.createElement(u,Object(l.a)({htmlFor:b},p,{className:E}))};E.propTypes=p,E.defaultProps=f,a.a=E}}]);
//# sourceMappingURL=166.0a8da444.chunk.js.map