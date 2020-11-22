import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
import useHttp from '../../hooks/http';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';

import ErrorModal from '../UI/ErrorModal';

const ingredientReducer = (currentIngredients, action) => {
  switch(action.type) {
    case 'SET': return action.ingredients;
    case 'ADD': return [...currentIngredients, action.ingredient];
    case 'DELETE': return currentIngredients.filter(ingredient => ingredient.id !== action.id);
    default: throw new Error('Should not get there!');
  }
};



function Ingredients() {
  const [ ingredients, dispatch] = useReducer(ingredientReducer, []);
  const { isLoading, error, data, sendRequest, reqExtra, reqIdentifier, clear } = useHttp();

  useEffect(() => {
    if(!isLoading && !error) {
      if(reqIdentifier === 'REMOVE_INGREDIENT') {
        dispatch({ type: 'DELETE', id: reqExtra});
      }
      else if(data && reqIdentifier === 'ADD_INGREDIENT') {
        dispatch({
          type: 'ADD', 
          ingredient: { id: data.name, ...reqExtra }
        })
      }
    }
  }, [data, reqExtra, reqIdentifier, isLoading, error]);

  const addIngredientHandler = useCallback(ingredient => {
    sendRequest(
      'https://react-hooks-update-6d8c0.firebaseio.com/ingredients.json', 
      'POST', 
      JSON.stringify(ingredient), 
      ingredient, 
      'ADD_INGREDIENT'
    );
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(id => {
    sendRequest(
      `https://react-hooks-update-6d8c0.firebaseio.com/ingredients/${id}.json`, 
      'DELETE', 
      null, 
      id, 
      'REMOVE_INGREDIENT'
    );

  }, [sendRequest]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({
      type: 'SET', 
      ingredients: filteredIngredients
    });
  }, []);

  const ingredientList = useMemo(() => {
    return <IngredientList 
      ingredients={ingredients} 
      onRemoveItem={removeIngredientHandler} 
    />
  }, [ingredients, removeIngredientHandler])

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}

      <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
