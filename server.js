const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

const storeSchema = new mongoose.Schema({
  product: String,
  price: Number,
  rating: Number,
  createdAt: Date,
  status: String,
  colorIds: [String],
});

const Store = mongoose.model('Store', storeSchema);

const typeDefs = gql`
  fragment Meta on Store {
    createdAt
    rating
  }

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

  input ColorInput {
    id: ID
  }

  input StoreInput {
    id: ID
    product: String
    price: Int
    rating: Int
    createdAt: Date
    status: Status
    color: [ColorInput]
  }

  type Mutation {
    addStore(store: StoreInput): [Store]
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
    stores: async () => {
      try {
        const allStores = await Store.find();
        return allStores;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    store: async (obj, { id }) => {
      try {
        const foundStore = await Store.findById(id);
        return foundStore;
      } catch (error) {
        console.error(error);
        return {};
      }
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
    addStore: async (obj, { store }, { userId }) => {
      try {
        if (userId) {
          //Do mutation and of database stuff
          await Store.create({
            ...store,
          });
          const allStores = await Store.find();
          return allStores;
        }
        return stores;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
  },

  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'creating date of product upload',
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
  context: ({ req }) => {
    const fakeUser = {
      userId: "HelloI'mUser",
    };
    return {
      ...fakeUser,
    };
  },
});

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function () {
  console.log('database connected...');
  server
    .listen({
      port: process.env.PORT || 5000,
    })
    .then(({ url }) => console.log(`Server started at ${url}`));
});
