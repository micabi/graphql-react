# graphQLバックエンド側

Node.jsを用いてtypescriptでデータベースの作成、DBサーバーを立ち上げる。
立ち上げるサーバーはgraphQLを扱えるApolloServerを使う。

## @prisma/client

prismaとは、データベースの読み書きをSQL文を使わずにTypeScriptで操作できるようになる
ORM(Object-Relational Mapping: オブジェクト関係マッピング)と呼ばれるツール。

graphQLであってもDBサーバーそのものはMySqlであったりSQLiteだったり既存のものを使う。
graphQLはあくまでクエリ言語(SQLの方言)である。

JavaScriptは単体でSQLクエリを実行する機能を持たないので、クライアントと呼ばれるライブラリ(MySqlクライアントなど)を使ってSQL文を発行する。今回のようにJavaScriptからgraphQLのクエリを実行するのに使われるクライアントがprisma/client(とフロント側ではapollo/client)。

prisma/clientはtypescriptのメソッドを介して書かれたgraphQLのSQL文をMySqlやSQLiteなどDBに合った命令文に変換してDBテーブルの作成や変更を行なってくれる。

ApolloServerはgraphQLのクエリを変換しDB(SQliteなど)からデータのリクエスト/レスポンスをおこなう。

## nodemonとts-nodeを入れる理由

nodemonはsrcディレクトリ内のtsファイルを更新したときにリロードを行なってもらうため。tsをjsにコンパイルするためにts-nodeを入れている。

### インストールと初期化

インストール

```zsh
npm i -D prisma
```

初期化(DBとしてSQLiteを選択した場合)

```zsh
npx prisma init --datasource-provider sqlite
```

prismaディレクトリと.envファイルが生成される。

## スキーマ(データベースの構造をPrismaで模したもの)を編集

initコマンドで生成されたprisma/schema.prismaファイルを編集してデータベース構造のテンプレートを作る。

今回はsqliteを使うのでデータベーステーブルの名前と構造をsqliteの記法に従って書く(modelの部分)。

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
    url      = env("DATABASE_URL")
}

model Todo {
  id String @id @default(cuid())
  title String
  completed Boolean
  createdAt DateTime @default(now())
}
```

データベースファイルの場所は.envファイルに書く。
この書き方ならprismaディレクトリの直下に配置される。

```.env
DATABASE_URL="file:./dev.db"
```

## ジェネレート

Prisma ClientやAPIクライアントなどのコード、TypeScriptの型情報を生成する。

```zsh
npx prigma generate
```

## マイグレート

schemaファイルに記述したモデルを反映させた実際のデータベースを生成する。
スキーマ変更したらマイグレーションをすることでデータベース構造を段階的に記録する。

```zsh
npx prisma migrate dev --name <マイグレーション名>
```

prismaディレクトリの中に.envで指定したdev.dbが生成されるとともに、
migrationsディレクトリができる。この中には実際に実行されたSQL文が格納されている。
--nameの部分はsqlファイルが格納されたディレクトリの末尾に__<マイグレーション名>と入る。

## データベースの変更・編集・更新

一度作ったデータベースにカラムを追加したり削除する必要がでた場合、
schema.prismaを修正し、

```prisma
@schema.prisma

model Todo {
  // String型からInt型へ変更。インクリメントで採番されるように変更
  id Int @id @default(autoincrement())
  title String
  completed Boolean
  createdAt DateTime @default(now())
}
```

ふたたびマイグレート

```zsh
npx prisma migrate dev (--name <マイグレーション名>)
```

## ※データベースを破棄して作り直す場合

データをすべて破棄してschema.prismaをもとに再構築する。

```zsh
npx prisma migrate reset
```

## 出来上がったテーブルをGUIで見てみる

```zsh
npx prisma studio
```

phpMyAdminのように出来上がったテーブル構造がGUIで見ることができる。

## graphQL

クエリ言語。CRUDで言うgetとそれ以外(mutation)の2種類で読み書き更新、削除をおこなうSQL言語の一つ。
テーブルの構造とプロパティの型を定義したtypeDefsと、CRUD処理をどのようなメソッド名で呼び出すかを定義したresolversで構成される。
graphQL自体はただのクエリ言語なので実行するためにはクライアントと呼ばれるツールが必要(@prisma/clientや@apollo/client)。

```typescript
@src/server.ts

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

type typeTodo = {
  id: number,
  title: string,
  completed: boolean,
};

// いったんDB代わりのオブジェクト
const todos: typeTodo[] = [
  {
    id: "1",
    title: "GraphQL",
    completed: false
  },
  {
    id: "2",
    title: "React",
    completed: false
  }
];

const typeDefs = `#graphql
  type Todo {
    id: Int!,
    title: String!,
    completed: Boolean!
  }

  type Query {
    getTodos: [Todo!]!
  }

  type Mutation {
    addTodo(title: String!): Todo!
    updateTodo(id: Int!, completed: Boolean!): Todo!
    deleteTodo(id: Int!): Todo!
  }
`;

const resolvers = {
  Query: { // Queryはget
    getTodos: (): typeTodo[] => todos
  },

  Mutation: { // Mutationはcreate(post), update(put), delete(patch)
    // 関数名(data: {オブジェクト}) dataは1件のオブジェクト
    addTodo: ( _: typeTodo, { title }: { title: string } ): typeTodo => {
      const newTodo: typeTodo = {
        id: String( todos.length + 1 ),
        title,
        completed: false,
      };

      todos.push( newTodo );
      return newTodo;
    },

      updateTodo: ( _: typeTodo, { id, completed }: { id: string, completed: boolean; } ): typeTodo => {
        // console.log(id, typeof id);
        const update_todo: typeTodo | undefined = todos.find( ( todo: typeTodo ): boolean => todo.id === id );
        // console.log(update_todo);

        if ( update_todo === undefined ) {
          throw new Error( "ありません" );
        } else {
          update_todo.completed = completed; // 引数で受け取ったcompletedをupdate_todoのプロパティcompletedの値に代入する
          return update_todo;
        }
      },

      deleteTodo: ( _: typeTodo, { id }: { id: string; } ): typeTodo => {
        const delete_todo_id: number = todos.findIndex( ( todo: typeTodo ): boolean => todo.id === id );

        if ( delete_todo_id === -1 ) {
          throw new Error( "そのidはありません" );
        } else {
          // console.log(todos);
          console.log( todos[ delete_todo_id ] );
          const deleted: typeTodo[] = todos.splice( delete_todo_id, 1 ); // todos[]の中から選択されたインデックスの要素を削除したものを返す
          // console.log(deleted); 削除すると選択されたオブジェクトが入った配列(1個)
          // console.log(deleted[0]); // 1つだけ入っている配列の要素
          return deleted[ 0 ];
          // return todos[delete_todo_id];

        }
      }
  }
};

// サーバー(GraphQLに必要なtypeDefsとresolversを引数として渡す)
const server = new ApolloServer( {
  typeDefs,
  resolvers,
} );

async function startServer (): Promise<void> {
  const { url } = await startStandaloneServer( server, {
    listen: { port: 4000 },
    context: async (): Promise<{ prisma: PrismaClient; }> => ( { prisma } )
  } );


  console.log( `Server ready at: ${ url }` );
}

startServer();
```

## Apollo Server

apolloServerで作るgraphQLの構文を理解できるサーバー。
バックエンド側で起動させることでgraphQL APIとして機能させる。
DBサーバーとプログラムの間に介在してgraphQLで書かれたクエリをバックエンド側では@prisma/client、フロントエンド側では@apollo/clientを介して実行することでCRUDできる。
バックエンド側で立ち上げるがフロントエンド側からもクライアントを介して接続されてCRUDできるようになる。

## サーバー起動

```zsh
npm run start
```
