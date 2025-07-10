type typeTodo = {
  id: number,
  title: string,
  completed: boolean,
};

type Resolvers = {
  Query: {},
  Mutation: {}
};
export {typeTodo, Resolvers};