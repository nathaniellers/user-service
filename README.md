# User Service

## Microservices built with Node.js and TypeScript using Serverless Framework with DynamoDB. 🔥

### Features
- Serverless Framework: Enables deployment of the service as AWS Lambda functions.
- DynamoDB: Utilized for scalable and flexible data storage.
- TypeScript: Ensures type safety and modern JavaScript features.

### Prerequisites
- Node.js (version 14.x or later)
- Serverless Framework
- AWS account with appropriate permissions

## Installation

### Clone the repository:
bash
Copy
Edit
```git clone https://github.com/nathaniellers/user-service.git```

### Navigate to the project directory:
bash
Copy
Edit
```cd user-service```

### Install dependencies:
bash
Copy
Edit
npm install

### Configuration
- Ensure that your AWS credentials are configured properly. 🔨
- You can set them up using the AWS CLI or by setting environment variables.

### Deployment
To deploy the service to AWS, run:

bash
Copy
Edit
```serverless deploy```
This command will package and deploy your service based on the configurations defined in serverless.yml.

Testing
To run tests via Jest, execute:

bash
Copy
Edit
```npm test```
This will run the test suites defined for the service.

### Usage
After deployment, you can interact with the service endpoints as defined in the serverless.yml file.
Refer to the AWS API Gateway console or the Serverless Framework dashboard for the exact endpoints.

### Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

### License
This project is licensed under the MIT License. See the LICENSE file for details.

### Acknowledgments
- Inspired by best practices in serverless application development. ✨
- Thanks to the open-source community for continuous support. ✔️

Note: This README is based on the information available in the repository and may need further customization based on specific project details.
