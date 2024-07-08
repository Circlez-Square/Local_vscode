// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        mapping(address => bool) refundsInitiated;    // 一個判斷地址是否退完款， 原本是是False
        bool isactive; //新增一個終止條件
        bool failed;  // 新增：标识众筹是否失败

    }

    Campaign[] public campaigns; //建一個
    mapping(uint256 => mapping(address => uint256)) public balances;
    uint256 public numberOfCampaigns = 0;  //給定初始值

    function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256) {
        campaigns.push();     
        Campaign storage newCampaign = campaigns[campaigns.length - 1];
        newCampaign.owner = _owner;
        newCampaign.title = _title;
        newCampaign.description = _description;
        require(_target > 0, "Target amount must be greater than zero.");
        newCampaign.target = _target;
        newCampaign.deadline = _deadline;
        newCampaign.amountCollected = 0;
        newCampaign.image = _image;
        newCampaign.isactive = true;  // 设置活动为活跃状态
        uint256 newCampaignId = numberOfCampaigns;
        numberOfCampaigns++;

        return newCampaignId;  //所以  numberOfCampaigns 保持与活动数组 campaigns 的长度同步
        // campaigns.push(newCampaign); 
        // return numberOfCampaigns - 1; // Return the index of the new campaign
    }

    function donateToCampaign(uint256 _id) public payable {
        require(_id < campaigns.length, "Campaign does not exist.");
        Campaign storage campaign = campaigns[_id];  // 因此不用像 balance 一樣加入 id

        require(!campaign.refundsInitiated[msg.sender], "Refund has already been initiated for this donator");
        require(campaign.isactive, "Campaign is not active");  // 确保活动仍然处于活跃状态
        require(block.timestamp < campaign.deadline, "Fundraising has ended");  // 确保捐款发生在募资截止日期之前

        uint256 amount = msg.value; 
        balances[_id][msg.sender] += amount;
        campaign.donators.push(msg.sender);   
        campaign.donations.push(amount);
        campaign.amountCollected += amount;
    }

    function finalizeCampaign(uint256 _id) public {
        require(_id < campaigns.length, "Campaign does not exist.");
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp >= campaign.deadline, "Fundraising has not ended yet.");
        require(campaign.isactive, "Campaign is not active.");

        if (campaign.amountCollected >= campaign.target) {
            (bool sent, ) = payable(campaign.owner).call{value: campaign.amountCollected}("");
            require(sent, "Transfer failed");
        }

        else {
             campaign.failed = true;  // 标记众筹失败
    }
    campaign.isactive = false;  // 关闭活动
            
    }    
    function withdrawFunds(uint256 _id) public {
        require(_id < campaigns.length, "Campaign does not exist.");
        Campaign storage campaign = campaigns[_id];
        require(campaign.failed, "Fundraising did not fail.");
        uint256 refundAmount = balances[_id][msg.sender];
        require(refundAmount > 0, "No funds to refund");
        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund failed");
        balances[_id][msg.sender] = 0;
    }

}