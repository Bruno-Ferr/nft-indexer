import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Alchemy, Network } from 'alchemy-sdk';
import { useState } from 'react';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  async function connectWallet() {
    try {
      if(!ethereum) return alert("Please install metamask");
      const account = await ethereum.request({ method: 'eth_requestAccounts'})

      setUserAddress(account[0])
    } catch (error) {
      throw new Error("No Ethereum object.")
    }
  }

  async function getNFTsForOwner() {
    try {
      if(userAddress === '') return alert('No wallet connected!') 
      setLoading(true)
      const config = {
        apiKey: 'fM36Ntbc8M4HXRYS41PfOFVllklMd_JQ',
        network: Network.ETH_MAINNET,
      };

      const alchemy = new Alchemy(config);
      const data = await alchemy.nft.getNftsForOwner(userAddress);
      setResults(data);

      const tokenDataPromises = [];

      for (let i = 0; i < data.ownedNfts.length; i++) {
        const tokenData = alchemy.nft.getNftMetadata(
          data.ownedNfts[i].contract.address,
          data.ownedNfts[i].tokenId
        );
        tokenDataPromises.push(tokenData);
      }

      setTokenDataObjects(await Promise.all(tokenDataPromises));
      setHasQueried(true);
      setLoading(false);
    } catch (error) {
      throw new Error(error.message)
    }
  }
  return (
    <Box w="100vw"> 
      
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            NFT Indexer 🖼
          </Heading>
          <Text>
            Plug in an address and this website will return all of its NFTs!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>Get all the ERC-721 tokens of this address:</Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
          placeholder={userAddress}
        />
        <Button fontSize={20} onClick={getNFTsForOwner} mt={36} bgColor="blue">
          Fetch NFTs
        </Button>
        <button fontSize={20} mt={36} onClick={connectWallet}>
          Connect Wallet
        </button>

        <Heading my={36}>Here are your NFTs:</Heading>

        {loading && (
          <Text>Loading...</Text>
        )}

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.ownedNfts.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="white"
                  bg="blue"
                  w={'20vw'}
                  key={e.id}
                >
                  <Box>
                    <b>Name:</b>{' '}
                    {tokenDataObjects[i].title?.length === 0
                      ? 'No Name'
                      : tokenDataObjects[i].title}
                  </Box>
                  <Image
                    src={
                      tokenDataObjects[i]?.rawMetadata?.image ??
                      'https://via.placeholder.com/200'
                    }
                    alt={'Image'}
                  />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! The query may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;
