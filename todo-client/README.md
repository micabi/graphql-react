# graphQLフロントエンド側

## @apollo/client

バックエンド側で立てたApolloServerに対してgraphQLで書いたクエリ文を@apollo/clientを介して実行することでデータをCRUDできる。

```zsh
npm i @apollo/client
```

## Reactのmain.tsxにclientを読み込む

・ApolloClient, InMemoryCache, ApolloProviderをインポートする。
・\<App />を\<ApolloProvider>で挟む。

```tsx
@main.tsx

...
import App from './App.tsx';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

...

const cachetype = new InMemoryCache(
  // どのクエリーに対してキャッシュを効かせるか
);

const apolloclient = new ApolloClient( {
  uri: "http://localhost:4000", // apollo-server
  cache: cachetype,
} );

createRoot( document.getElementById( 'root' )! ).render(
  <StrictMode>
    <ApolloProvider client={ apolloclient }>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
```

## ReactのApp.tsxにもclientを読み込む

```tsx
@App.tsx

import { gql, useQuery, useMutation } from "@apollo/client";
import { type DocumentNode } from "graphql";

...

// graphqlによるクエリ文
const GET_TODOS: DocumentNode = gql`...`; // get
const ADD_TODO: DocumentNode = gql`...`; // post create
const UPDATE_TODO: DocumentNode = gql`...`; // patch
const DELETE_TODO: DocumentNode = gql`...`; // delete

function App() {

  // getについてのキャッシュ
  const { loading, error, data } = useQuery( GET_TODOS, {
    fetchPolicy: "network-only" // main.tsで決めたキャッシュポリシーに従ってデータを取得
  } );

  // クエリ実行後の返り値を変数に収める
  const todos = data ? data.getTodos : [];
  const [ addTodo ] = useMutation( ADD_TODO );
  const [ updateTodo ] = useMutation( UPDATE_TODO );
  const [ deleteTodo ] = useMutation( DELETE_TODO );

// Reactのイベントハンドル用関数
async function handleAddTodo (): Promise<void> {
    await addTodo( {
      variables: { title },
      refetchQueries: [ { query: GET_TODOS } ],
    } );
    setTitle( "" );
  }

  // update
  async function handleUpdateTodo ( id: number, completed: boolean ): Promise<void> {
    await updateTodo( {
      variables: { id, completed: !completed },
      refetchQueries: [ { query: GET_TODOS } ],
    } );
  }
  // delete
  async function handleDeleteTodo ( id: number ): Promise<void> {
    await deleteTodo( {
      variables: { id },
      refetchQueries: [ { query: GET_TODOS } ]
    } );
  }

  if ( data ) console.log( data );
  if ( loading ) return <p>Loading...</p>;
  if ( error ) return <p>Error: { error.message }</p>;

  return (
    <>
      {
        todos.map((todo) => {
          todo.id

          todo.title

          todo.completed
        });
      }
    </>
  );
}
```

## 開発サーバー起動

```zsh
npm run dev
```
