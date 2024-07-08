import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const FundraisingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [donationAmounts, setDonationAmounts] = useState({});
  const [withdrawalAmounts, setWithdrawalAmounts] = useState({});
  const [balances, setBalances] = useState({});

  const contractABI = [
    "function campaigns(uint256) public view returns (address, string memory, string memory, uint256, uint256, uint256, string memory, bool, bool)",
    "function numberOfCampaigns() public view returns (uint256)",
    "function balances(uint256, address) public view returns (uint256)",
    "function donateToCampaign(uint256) public payable",
    "function finalizeCampaign(uint256) public",
    "function withdrawFunds(uint256) public"
  ];

  const fetchProjects = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractAddress = "0xD22825019dC47437a43309864a7ADE203d06a824";
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const campaignCount = await contract.numberOfCampaigns();

    const campaignPromises = [];
    for (let i = 0; i < campaignCount; i++) {
      campaignPromises.push(contract.campaigns(i));
    }

    const campaigns = await Promise.all(campaignPromises);
    const updatedCampaigns = campaigns.map(campaign => {
      const deadline = new Date(campaign[4] * 1000);
      const now = new Date();
      const isExpired = now > deadline;
      const targetReached = ethers.BigNumber.from(campaign[5]).gte(campaign[3]);
      const isActive = !isExpired && !targetReached && campaign[7];
      const isFinalized = campaign[8];
      
      return {
        owner: campaign[0],
        title: campaign[1],
        description: campaign[2],
        target: ethers.utils.formatUnits(campaign[3], 'ether'),
        deadline: deadline.toLocaleDateString(),
        amountCollected: ethers.utils.formatUnits(campaign[5], 'ether'),
        image: getImageUrl(campaign[6]),
        isActive: isActive,
        canFinalize: !isActive && !isFinalized,
        canWithdraw: isFinalized
      };
    });
    setProjects(updatedCampaigns);

    const balancePromises = updatedCampaigns.map((_, index) => contract.balances(index, provider.getSigner().getAddress()));
    const balances = await Promise.all(balancePromises);
    const balancesFormatted = balances.map(balance => ethers.utils.formatUnits(balance, 'ether'));
    setBalances(balancesFormatted);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDonationChange = (id, value) => {
    setDonationAmounts(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleWithdrawalChange = (id, value) => {
    setWithdrawalAmounts(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const donateToCampaign = async (id) => {
    const amount = donationAmounts[id];
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      const contractAddress = "0xD22825019dC47437a43309864a7ADE203d06a824";
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.donateToCampaign(id, { value: ethers.utils.parseUnits(amount, 'ether') });
      await tx.wait();
      alert('Donation successful!');
      fetchProjects(); // 重新加載項目以更新狀態
    } catch (error) {
      console.error('Error donating to campaign:', error);
      alert('Error donating to campaign');
    }
  };

  const withdrawFunds = async (id) => {
    const amount = withdrawalAmounts[id];
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log('Signer Address:', address);

      const contractAddress = "0xD22825019dC47437a43309864a7ADE203d06a824";
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const balance = await contract.balances(id, await signer.getAddress());
      const formattedBalance = ethers.utils.formatUnits(balance, 'ether');
      console.log('User Balance:', formattedBalance);
      console.log('Withdrawal Amount:', amount);

      if (parseFloat(amount) > parseFloat(formattedBalance)) {
        alert('Insufficient balance');
        return;
      }

      const tx = await contract.withdrawFunds(id);
      await tx.wait();
      alert('Withdrawal successful!');
      fetchProjects(); // 重新加載項目以更新狀態
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      alert(`Error withdrawing funds: ${error.message}`);
    }
  };

  const finalizeCampaign = async (id) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contractAddress = "0xD22825019dC47437a43309864a7ADE203d06a824";
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.finalizeCampaign(id);
      await tx.wait();
      alert('Campaign finalized successfully!');
      fetchProjects(); // 重新加載項目以更新狀態
    } catch (error) {
      console.error('Error finalizing campaign:', error);
      alert(`Error finalizing campaign: ${error.message}`);
    }
  };

  const getImageUrl = (imageUrl) => {
    const googleDriveUrlPattern = /https:\/\/drive.google.com\/file\/d\/(.+?)\/view\?usp=sharing/;
    const match = imageUrl.match(googleDriveUrlPattern);
    if (match) {
      return `https://drive.google.com/uc?id=${match[1]}`;
    }

    const googleDriveDownloadPattern = /https:\/\/drive.usercontent\.google.com\/download\?id=(.+?)&?authuser=\d?/;
    const downloadMatch = imageUrl.match(googleDriveDownloadPattern);
    if (downloadMatch) {
      return `https://drive.google.com/uc?id=${downloadMatch[1]}`;
    }

    return imageUrl;
  };

  return (
    <div>
      <h2>Fundraising Projects</h2>
      {projects.length === 0 ? (
        <p>No projects available.</p>
      ) : (
        <ul>
          {projects.map((project, index) => (
            <li key={index}>
              <h3>{project.title}</h3>
              <p>Owner: {project.owner}</p>
              <p>Description: {project.description}</p>
              <p>Target Amount: {project.target} ETH</p>
              <p>Deadline: {project.deadline}</p>
              <p>Amount Collected: {project.amountCollected} ETH</p>
              <img src={project.image} alt={project.title} style={{ width: '450px' }} onError={(e) => {e.target.onerror = null; e.target.src = index % 2 === 0 ?'default-image1-url.png': 'default-image-url.png';}}/>
              {project.isActive ? (
                <div>
                  <input
                    type="number"
                    placeholder="Amount to donate (ETH)"
                    value={donationAmounts[index] || ''}
                    onChange={(e) => handleDonationChange(index, e.target.value)}
                  />
                  <button onClick={() => donateToCampaign(index)}>Donate</button>
                </div>
              ) : (
                <div>
                  <p>Status: {project.canFinalize ? 'Ended' : (project.canWithdraw ? 'Finalized' : 'Active')}</p>
                  {project.canFinalize && (
                    <button onClick={() => finalizeCampaign(index)}>Finalize Campaign</button>
                  )}
                  {project.canWithdraw && (
                    <>
                      <input
                        type="number"
                        placeholder="Amount to withdraw (ETH)"
                        value={withdrawalAmounts[index] || ''}
                        onChange={(e) => handleWithdrawalChange(index, e.target.value)}
                      />
                      <button onClick={() => withdrawFunds(index)}>Withdraw Funds</button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FundraisingProjects;