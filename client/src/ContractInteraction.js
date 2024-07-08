import React, { useState } from 'react';
import { ethers } from 'ethers';

const ContractInteraction = () => {
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    owner: '',
    title: '',
    description: '',
    target: '',
    deadline: '',
    image: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      const contractAddress = "0xD22825019dC47437a43309864a7ADE203d06a824";
      const contractABI = [
        "function createCampaign(address owner, string memory title, string memory description, uint256 target, uint256 deadline, string memory image) public returns (uint256)"
      ];
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.createCampaign(
        formData.owner,
        formData.title,
        formData.description,
        ethers.utils.parseUnits(formData.target, "ether"),
        Math.floor(new Date(formData.deadline).getTime() / 1000),
        formData.image
      );
      await tx.wait();
      setMessage('Campaign created!');
      setShowForm(false);} // 隐藏表单
      catch (error) {
        console.error('Error creating campaign:', error);
        setMessage('Error creating campaign');
      }
  };

  const callApi = async () => {
    try {
      const response = await fetch('/api');
      const data = await response.text();
      alert(data);
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  return (
    <div>
      {!showForm ? (
        <div>
          <button onClick={() => setShowForm(true)}>Create Campaign</button>
          <button onClick={callApi}>Call API</button>
        </div>
      ) : (
        <form onSubmit={createCampaign}>
          <div>
            <label>Owner Address:</label>
            <input type="text" name="owner" value={formData.owner} onChange={handleChange} required />
          </div>
          <div>
            <label>Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div>
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>
          <div>
            <label>Target Amount (ETH):</label>
            <input type="number" name="target" value={formData.target} onChange={handleChange} required />
          </div>
          <div>
            <label>Deadline:</label>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
          </div>
          <div>
            <label>Image URL:</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} required />
          </div>
          <button type="submit">Submit</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default ContractInteraction;
