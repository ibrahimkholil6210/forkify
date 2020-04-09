// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import {elements,renderLoader,clearLoader} from './view/base';
import * as searchView from './view/searchView';
import * as recipeView from './view/recipeView';
import * as listView from './view/listView';
import * as likesView from './view/likesView';

// Global state of application
const state = {};

const controlSearch = async () => {
    //Get query
    const query = searchView.getInput();
    if(query){
        state.seacrh = new Search(query);
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchResult);
        try{
            await state.seacrh.getResults();
            clearLoader();
            searchView.renderResults(state.seacrh.results);
        }catch(err){
            alert("Error processing search!");
            clearLoader();
        }
    } 
}

elements.searchForm.addEventListener('submit',e => {
    e.preventDefault();
    controlSearch();
})

elements.searchPagination.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goTo = parseInt(btn.dataset.goto,10);
        searchView.clearResult();
        searchView.renderResults(state.seacrh.results,goTo);
    }
});


//Recipe controller

const controlRecipe = async (e) => {
    const id =  window.location.hash.replace('#','');

    if(id){
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        if(state.seacrh)searchView.linkGetsHighlighted(id);
        state.recipe = new Recipe(id);

        try{
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServings();
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id));
        }catch(err){
            alert('Error precessing recipe!');
            clearLoader();
        }
    }
}

['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));

const controlList = () => {
    if(!state.list) state.list = new List();

    state.recipe.ingredients.forEach(item => {
        const newItem = state.list.addItem(item.count,item.unit,item.ingredient);
        listView.renderItem(newItem);
    })
}

elements.shopping_list.addEventListener('click',e => {
    const id = e.target.closest('.shopping__item').dataset.id;

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id);
        listView.deleteItem(id);
    }else if(e.target.matches('.shopping__count--value')){
        const value = parseFloat(e.target.value);
        state.list.updateCount(id,value)
    }
});

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();

    const id = state.recipe.id;

    if(!state.likes.isLiked(id)){
        const newLike = state.likes.addLike(
            id,
            state.recipe.title,
            state.recipe.publisher,
            state.recipe.img
        );

        likesView.toggleLikeBtn(true);
        likesView.renderLike(newLike);
    }else{
        state.likes.deleteLike(id);
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(id);
    }
    
    likesView.toggleLikeMenu(state.likes.getNumOfLike());
}

elements.recipe.addEventListener('click',e => {
    if(e.target.matches('.btn-decrease , .btn-decrease *')){
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIng(state.recipe);
        }
    }else if(e.target.matches('.btn-increase , .btn-increase *')){
        state.recipe.updateServings('inc');
        recipeView.updateServingsIng(state.recipe);
    }else if(e.target.matches('.recipe__btn--add , .recipe__btn--add *')){
        console.log()
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
});


window.addEventListener('load',() => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumOfLike());

    state.likes.likes.forEach(like => {
        likesView.renderLike(like);
    })
});
