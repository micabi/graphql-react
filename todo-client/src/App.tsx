import { gql, useQuery, useMutation } from "@apollo/client";
import { type DocumentNode } from "graphql";
import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ListPlus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const MotionBtn = motion.create( Button );
const MotionInput = motion.create( Input );

// クエリー文

// useQuery, useMutationの引数として使うためapollo/clientからgqlをimportすることは必須である
const GET_TODOS: DocumentNode = gql`
  query {
    getTodos {
      id
      title
      completed
    }
  }
`;

const ADD_TODO: DocumentNode = gql`
  mutation addTodo($title: String!) {
    addTodo(title: $title) {
      title
    }
  }
`;

const UPDATE_TODO: DocumentNode = gql`
  mutation updateTodo($id: Int!, $completed: Boolean!) {
    updateTodo(id: $id, completed: $completed) {
      id
      completed
    }
  }
`;

const DELETE_TODO: DocumentNode = gql`
  mutation deleteTodo($id: Int!) {
    deleteTodo(id: $id) {
      id
    }
  }
`;

type Todo = {
  id: number,
  title: string,
  completed: boolean,
};

function App (): React.JSX.Element {

  // const todos: Todo[] = [
  //   {
  //     id: 1,
  //     title: "test1",
  //     completed: false
  //   },
  //   {
  //     id: 2,
  //     title: "test2",
  //     completed: true
  //   },
  // ];

  // apolloClientを使ってクエリーの実行
  const { loading, error, data } = useQuery( GET_TODOS, {
    fetchPolicy: "network-only" // main.tsで決めたキャッシュポリシーに従ってデータを取得
  } );

  // get
  const todos: Todo[] = data ? data.getTodos : [];
  // console.log( todos );

  const [ title, setTitle ] = useState( "" );

  // apolloClientのuseMutationは配列(タプル)で返る。
  // add
  const [ addTodo ] = useMutation( ADD_TODO ); // 返り値をgraphQLでで定義したメソッドaddTodoに割り当て
  // update
  const [ updateTodo ] = useMutation( UPDATE_TODO );
  // delete
  const [ deleteTodo ] = useMutation( DELETE_TODO );

  // React内で使うためのイベントハンドラー
  // add
  async function handleAddTodo (): Promise<void> {
    await addTodo( {
      variables: { title }, // server.tsで定義したメソッドの引数
      refetchQueries: [ { query: GET_TODOS } ], // このメソッドを実行した後に実行するクエリ(コールバック)
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
      <div className="min-h-screen flex items-center bg-linear-to-tr from-purple-50 to-purple-100">
        <motion.div
          initial={ { opacity: 0, y: -100 } }
          animate={ { opacity: 1, y: 1 } }
          className="m-auto shadow-lg"
        >
          {/* <div className="m-auto shadow-lg"> */ }
          <div className="bg-linear-to-r from-violet-600 to-indigo-400 h-16 pl-2 pr-2 leading-16 rounded-t-lg">
            <label htmlFor="new" className="text-white font-bold">New
              <MotionInput
                whileHover={ { scale: 1.1 } }
                type="text"
                value={ title }
                onChange={ ( e: ChangeEvent<HTMLInputElement> ): void => setTitle( e.target.value ) }
                id="new"
                className="w-lg h-10 inline ml-4 mr-4 bg-white text-foreground font-normal"
              />
              {/* <Input
                type="text"
                value={ title }
                onChange={ ( e: ChangeEvent<HTMLInputElement> ): void => setTitle( e.target.value ) }
                id="new"
                className="w-3xs h-10 inline ml-4 mr-4 bg-white text-foreground font-normal"
              /> */}
            </label>
            <MotionBtn
              whileHover={ { scale: 1.1 } }
              className="cursor-pointer h-10 bg-amber-600 hover:bg-amber-500"
              onClick={ handleAddTodo }
            >
              <ListPlus />
            </MotionBtn>
            {/* <Button
                className="cursor-pointer h-10 bg-teal-600 hover:bg-teal-800"
                onClick={ handleAddTodo }
              >
                <ListPlus />
              </Button> */}

          </div>
          <ul>
            <AnimatePresence>
              {
                todos.map( ( todo: Todo ): React.JSX.Element => (
                  <motion.li
                    initial={ { opacity: 0, x: -150 } }
                    animate={ { opacity: 1, x: 0 } }
                    exit={ { opacity: 0, x: -150 } }
                    transition={ { duration: 0.3 } }
                    key={ todo.id }
                    id={ `todo-${ todo.id }` }
                    className={ `flex items-center pl-2 pr-2 border-b-1 border-slate-100 bg-white` }
                  >
                    {/* <li
                    key={ todo.id }
                    className={ `flex items-center pl-2 pr-2 border-b-1 border-slate-100 bg-white` }
                  > */}
                    <label htmlFor={ `todo-${ todo.id }` } className={ `cursor-pointer  ${ todo.completed ? "line-through text-slate-400" : "" }` }>
                      { todo.title }
                    </label>
                    <Checkbox
                      id={ `todo-${ todo.id }` }
                      className="h-5 ml-3"
                      checked={ todo.completed }
                      onClick={ (): Promise<void> => handleUpdateTodo( todo.id, todo.completed ) }
                    />
                    <MotionBtn
                      whileHover={ { scale: 1.1 } }
                      type="button"
                      className="bg-transparent shadow-none cursor-pointer text-rose-700 ml-2 hover:bg-transparent hover:underline"
                      onClick={ (): Promise<void> => handleDeleteTodo( todo.id ) }
                    >
                      <Trash2 />
                    </MotionBtn>
                    {/* <Button
                      type="button"
                      className="bg-transparent shadow-none cursor-pointer text-rose-700 ml-2 hover:bg-transparent hover:underline"
                      onClick={ (): Promise<void> => handleDeleteTodo( todo.id ) }
                    >
                      <Trash2 />
                    </Button> */}
                    {/* </li> */ }
                  </motion.li>
                ) )
              }
              { todos.length === 0 && (
                <motion.li
                  initial={ { opacity: 0, y: -150 } }
                  animate={ { opacity: 1, y: 0 } }
                  className="bg-white p-2"
                >NO ITEM...</motion.li>
              ) }
            </AnimatePresence>
          </ul>
          {/* </div> */ }
        </motion.div>
      </div>
    </>
  );
}

export default App;
