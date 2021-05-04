const initState = {
    documentFolderList : []
}

export const documentReducer = (state = initState, action) => {
  console.log('reducer: ', action.payload);
     switch(action.type){
         case "Get_Document_List" : return {...state, documentFolderList : action.payload};
        //  case "Get_Sub_Document_List": return {...state, documentSubFolderList : action.payload};

         default: return state;
     }
}
