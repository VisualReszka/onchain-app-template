'use client';

import { Avatar, Name, getName } from '@coinbase/onchainkit/identity';
import { Github, Globe, Twitter, ChevronDown } from 'lucide-react'; // Import ChevronDown
import { useEffect, useState } from 'react';
import { base } from 'viem/chains';
import { normalize } from 'viem/ens';
import { useAccount } from 'wagmi';
import { publicClient } from '../client';
import { motion } from 'framer-motion';

export default function IdentityWrapper() {
  const { address } = useAccount();
  const [ensText, setEnsText] = useState<{
    twitter: string | null;
    github: string | null;
    url: string | null;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const BASENAME_L2_RESOLVER_ADDRESS =
    '0xc6d566a56a1aff6508b41f6c90ff131615583bcd';

  //retrieve text records from ENS
  useEffect(() => {
    const fetchEnsText = async () => {
      const n = address
        ? await getName({ chain: base, address: address })
        : null;
      console.log('n', n);
      if (address) {
        console.log('Fetching ENS text for address:', address);
        //get the user's address from local storage
        console.log('address', address);

        try {
          //get the user's basename using getName from OCK
          const name = await getName({ chain: base, address: address });
          console.log('name', name);
          const normalizedAddress = normalize(name as string);
          console.log('normalizedAddress', normalizedAddress);
          //get twitter text record from basename
          const twitterText = await publicClient.getEnsText({
            name: normalizedAddress,
            key: 'com.twitter',
            universalResolverAddress: BASENAME_L2_RESOLVER_ADDRESS,
          });
          console.log('twitterText', twitterText);
          //get github text record from basename
          const githubText = await publicClient.getEnsText({
            name: normalizedAddress,
            key: 'com.github',
            universalResolverAddress: BASENAME_L2_RESOLVER_ADDRESS,
          });
          //get the user's website text record from basename
          const urlText = await publicClient.getEnsText({
            name: normalizedAddress,
            key: 'url',
            universalResolverAddress: BASENAME_L2_RESOLVER_ADDRESS,
          });
          console.log('urlText', urlText);
          //store the text records in an object
          const fetchedData = {
            twitter: twitterText,
            github: githubText,
            url: urlText,
          };
          //set the text records in state and local storage
          console.log('fetchedData', fetchedData);
          setEnsText(fetchedData);
          localStorage.setItem(address, JSON.stringify(fetchedData));
        } catch (error) {
          console.error('Error fetching ENS text:', error);
          if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
          }
        }
      } else {
        console.log('No address available');
      }
    };
    fetchEnsText();
    //check for any changes to the address
  }, [address]);
  return (
    <div className='mx-auto max-w-2xl p-4'>
      {address ? (
        <motion.div
          className='relative space-y-2'
          initial={{ opacity: 0, y: -20 }} // Initial state
          animate={{ opacity: 1, y: 0 }} // Animated state
          transition={{ duration: 0.5 }} // Animation duration
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className='flex cursor-pointer items-center justify-between space-x-2 rounded-full bg-white bg-opacity-20 p-2 transition-all duration-300 hover:bg-opacity-30'
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className='flex items-center space-x-2'>
              <Avatar address={address} chain={base} />
              <Name
                address={address}
                chain={base}
                className='text-m text-white'
              />
            </div>
            <ChevronDown
              className={`h-4 w-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />{' '}
            {/* Dropdown arrow */}
          </div>
          {ensText && (
            <motion.div
              className='rounded-lg bg-white bg-opacity-20 p-4 text-white shadow-md'
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {ensText.twitter && (
                <div className='flex items-center space-x-2'>
                  <Twitter className='h-4 w-4' />
                  <span>Twitter:</span>
                  <a
                    href={`https://x.com/${ensText.twitter}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:underline'
                  >
                    {ensText.twitter}
                  </a>
                </div>
              )}
              {ensText.github && (
                <div className='mt-2 flex items-center space-x-2'>
                  <Github className='h-4 w-4' />
                  <span>Github:</span>
                  <a
                    href={`https://github.com/${ensText.github}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:underline'
                  >
                    {ensText.github}
                  </a>
                </div>
              )}
              {ensText.url && (
                <div className='mt-2 flex items-center space-x-2'>
                  <Globe className='h-4 w-4' />
                  <span>Website:</span>
                  <a
                    href={ensText.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:underline'
                  >
                    {ensText.url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ) : (
        <div className='text-white'>
          Connect your wallet to view your profile card.
        </div>
      )}
    </div>
  );
}