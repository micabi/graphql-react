# Vite(React・TypeScript) + grapQL + Prisma + ApolloServer + SQLite

## バックエンド側(graphql-serverディレクトリ)

1. @prisma/clientでgraphQLのふるまいを決定し、データベース構造を作成。

2. テーブルの構造とプロパティの型を定義したtypeDefsと、CRUD処理をどのようなメソッド名で呼び出すかを定義したresolversで構成する。

3. 今回はDBとしてSQLiteを使う。

4. SQLiteとサーバーの間に入ってgraphQLのクエリ文を解釈しデータの読み書きを行なってくれるApolloServerを起動させる。

## フロントエンド側(todo-clientディレクトリ)

1. バックエンド側で起動しているApolloServerに対して@apollo/clientを介してgraphQLで書いたクエリ文を実行することでデータの読み書きをする。

2. @apollo/clientからuseQuery・useMutationメソッドをインポートしてバックエンドで定義したメソッド(バックエンド側 2.のresolversで定義したもの)を使ってデータを読み書きする。

3. @apollo/clientからメモリーキャッシュ、プロバイダーをインポートしてReactに取り込む。
