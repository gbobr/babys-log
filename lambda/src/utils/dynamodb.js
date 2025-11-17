/**
 * DynamoDB utilities for storing user-specific data
 * Each user has their own spreadsheet ID stored here
 */

const AWS = require('aws-sdk');
const logger = require('./logger');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'BabyTrackerUsers';

// Log table configuration on module load
logger.info('DynamoDB configured:', { table: TABLE_NAME, region: process.env.AWS_REGION || 'default' });

/**
 * Get user data from DynamoDB
 * @param {string} userId - Alexa user ID
 * @returns {Promise<Object|null>} User data or null if not found
 */
async function getUserData(userId) {
  try {
    logger.debug(`Getting user data from DynamoDB`);

    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { userId }
    }).promise();

    logger.debug('User data retrieved:', result.Item ? 'FOUND' : 'NOT FOUND');
    return result.Item || null;
  } catch (error) {
    logger.error('Error getting user data from DynamoDB:', error);
    throw error;
  }
}

/**
 * Save or update user data in DynamoDB
 * @param {string} userId - Alexa user ID
 * @param {Object} data - User data to save
 * @returns {Promise<void>}
 */
async function saveUserData(userId, data) {
  try {
    logger.debug('Saving user data to DynamoDB');

    const item = {
      userId,
      ...data,
      updatedAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: item
    }).promise();

    logger.info('User data saved successfully');
  } catch (error) {
    logger.error('Error saving user data to DynamoDB:', error);
    throw error;
  }
}

/**
 * Update specific fields in user data
 * @param {string} userId - Alexa user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateUserData(userId, updates) {
  try {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key, index) => {
      const placeholder = `#field${index}`;
      const valuePlaceholder = `:value${index}`;

      updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = updates[key];
    });

    // Always update the timestamp
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    await dynamodb.update({
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }).promise();

    logger.info('User data updated successfully');
  } catch (error) {
    logger.error('Error updating user data in DynamoDB:', error);
    throw error;
  }
}

/**
 * Delete user data from DynamoDB
 * @param {string} userId - Alexa user ID
 * @returns {Promise<void>}
 */
async function deleteUserData(userId) {
  try {
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { userId }
    }).promise();

    logger.info('User data deleted successfully');
  } catch (error) {
    logger.error('Error deleting user data from DynamoDB:', error);
    throw error;
  }
}

module.exports = {
  getUserData,
  saveUserData,
  updateUserData,
  deleteUserData
};
