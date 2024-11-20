import React, { useState, useEffect } from 'react';
import { Avatar, Name, getName } from '@coinbase/onchainkit/identity';
import { motion } from 'framer-motion';
import { Twitter, Github, Globe } from 'lucide-react';
import { normalize } from 'viem/ens';
import { publicClient } from '../client';
import { base } from 'viem/chains';


// Component code will go here

const IdentityWrapper: React.FC<{ address: string }> = ({ address }) => {
    const [ensText, setEnsText] = useState<{
      twitter: string | null;
      github: string | null;
      url: string | null;
    } | null>(null);
  
    const [isOpen, setIsOpen] = useState(false);
  
    const BASENAME_L2_RESOLVER_ADDRESS = '0xc6d566a56a1aff6508b41f6c90ff131615583bcd';
  
    useEffect(() => {
      const fetchEnsText = async () => {
        if (address) {
          try {
            const name = await getName({ chain: base, address: address });
            const normalizedAddress = normalize(name as string);
            const twitterText = await publicClient.getEnsText({
              name: normalizedAddress,
              key: 'com.twitter',
              universalResolverAddress: BASENAME_L2_RESOLVER_ADDRESS,
            });
            const githubText = await publicClient.getEnsText({
              name: normalizedAddress,
              key: 'com.github',
              universalResolverAddress: BASENAME_L2_RESOLVER_ADDRESS,
            });
            const urlText = await publicClient.getEnsText({
              name: normalizedAddress,
              key: 'url',
              universalResolverAddress: BASENAME_L2_RESOLVER_ADDRESS,
            });
            const fetchedData = {
              twitter: twitterText,
              github: githubText,
              url: urlText,
            };
            setEnsText(fetchedData);
            localStorage.setItem(address, JSON.stringify(fetchedData));
          } catch (error) {
            console.error('Error fetching ENS text:', error);
          }
        }
      };
      fetchEnsText();
    }, [address]);
  
    // Render logic will go here

    return (
  <>
    {address ? (
      <motion.div
        className="relative space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-2">
          <Avatar address={address} />
          <Name address={address} />
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-blue-500 hover:underline">
          {isOpen ? 'Hide' : 'Show'} Profile
        </button>
        {ensText && (
          <motion.div
            className="rounded-lg bg-white bg-opacity-20 p-4 text-white shadow-md"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {ensText.twitter && (
              <div className="flex items-center space-x-2">
                <Twitter className="h-4 w-4" />
                <span>Twitter:</span>
                <a
                  href={`https://x.com/${ensText.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {ensText.twitter}
                </a>
              </div>
            )}
            {ensText.github && (
              <div className="mt-2 flex items-center space-x-2">
                <Github className="h-4 w-4" />
                <span>Github:</span>
                <a
                  href={`https://github.com/${ensText.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {ensText.github}
                </a>
              </div>
            )}
            {ensText.url && (
              <div className="mt-2 flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Website:</span>
                <a
                  href={ensText.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {ensText.url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    ) : (
      <div className="text-white">Connect your wallet to view your profile card.</div>
    )}
  </>
);
  };

  export default IdentityWrapper;