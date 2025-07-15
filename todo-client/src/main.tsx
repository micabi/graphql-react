import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, type ApolloQueryResult } from '@apollo/client';

const cachetype = new InMemoryCache(
  // どのクエリーに対してキャッシュを効かせるか
);

const apolloclient = new ApolloClient( {
  uri: "http://localhost:5555/todos", // graphql-serveで作ったapollo-server
  cache: cachetype,
} );

apolloclient.query( {
  query: gql`
    query {
      getTodos {
        id
        title
        completed
      }
    }
    `,
} ).then( ( r: ApolloQueryResult<any> ): void => console.log( `r`, r ) );



createRoot( document.getElementById( 'root' )! ).render(
  <StrictMode>
    <ApolloProvider client={ apolloclient }>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
