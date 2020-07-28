const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const dotenv = require('dotenv');
dotenv.config();

const typeDefs = gql`
  scalar Date

  enum Status {
    BEST_SELLER
    POPULAR
    SOLD_OUT
    UNKNOWN
  }

  type Color {
    id: ID!
    name: String
  }

  type Store {
    id: ID!
    product: String!
    price: Int!
    rating: Int
    createdAt: Date
    status: Status
    color: [Color]
    #fake: float
    #fakes2: Boolean
  }

  type Query {
    stores: [Store]
    store(id: ID): Store
  }

  type Mutation {
    addStore(product: String, price: Int, createdAt: Date, id: ID): [Store]
  }
`;

const colors = [
  {
    id: 1,
    name: 'black',
  },
  {
    id: 2,
    name: 'white',
  },
  {
    id: 3,
    name: 'grey',
  },
];

const stores = [
  {
    id: '11A',
    product: 'UPS APC',
    price: 250000,
    rating: 5,
    createdAt: new Date('11-02-2019'),
    color: [
      {
        id: 1,
      },
    ],
  },
  {
    id: '22B',
    product: 'UPS ICA',
    price: 150000,
    rating: 5,
    createdAt: new Date('05-07-2019'),
    color: [
      {
        id: 2,
      },
    ],
  },
  {
    id: '33C',
    product: 'UPS EATON 5PX',
    price: 1500,
    rating: 5,
    createdAt: new Date('03-12-2019'),
    color: [
      {
        id: 3,
      },
    ],
  },
];

const resolvers = {
  Query: {
    stores: () => {
      return stores;
    },
    store: (obj, { id }, context, info) => {
      const foundStore = stores.find((store) => {
        return store.id === id;
      });
      return foundStore;
    },
  },

  Store: {
    color: (obj, arg, context) => {
      //DB call
      const colorIds = obj.color.map((color) => color.id);
      const filteredColors = colors.filter((color) => {
        return colorIds.includes(color.id);
      });
      return filteredColors;
    },
  },

  Mutation: {
    addStore: (obj, { id, product, price, createdAt }, context) => {
      const newStoreList = [
        ...stores,
        // new store data
        { id, product, price, createdAt },
      ];
      return newStoreList;
    },
  },

  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'created date of product upload',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});
server
  .listen({
    port: process.env.PORT || 5000,
  })
  .then(({ url }) => console.log(`Server started at ${url}`));
