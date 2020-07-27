const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  enum Status {
    BEST_SELLER
    POPULAR
    SOLD_OUT
    UNKNOWN
  }

  type Color {
    id: ID!
    nameColor: String
  }

  type Store {
    id: ID!
    product: String!
    price: Int!
    rating: Int
    status: Status
    color: [Color]
    #fake: float
    #fakes2: Boolean
  }

  type Query {
    stores: [Store]
    store(id: ID): Store
  }
`;

const stores = [
  {
    id: '11A',
    product: 'UPS APC',
    price: 250000,
    rating: 5,
    color: [
      {
        id: 1,
        nameColor: 'black',
      },
    ],
  },
  {
    id: '22B',
    product: 'UPS ICA',
    price: 150000,
    rating: 5,
    color: [
      {
        id: 2,
        nameColor: 'white',
      },
    ],
  },
  {
    id: '33C',
    product: 'UPS EATON 5PX',
    price: 1500,
    rating: 5,
    color: [
      {
        id: 3,
        nameColor: 'grey',
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
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => console.log(`Server started at ${url}`));
