import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sst from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const layerArn = "arn:aws:lambda:us-east-1:451483290750:layer:NewRelicNodeJS14X:36";
    const layer = lambda.LayerVersion.fromLayerVersionArn(this, "Layer", layerArn);

    // Create a HTTP API
    const api = new sst.Api(this, "Api", {
      defaultFunctionProps: {
        layers: [layer],
      },
      routes: {
        "GET /": "src/lambda.handler",
      },
    });

    // Configure NewRelic handler if no in local mode
    if (!scope.local) {
      this.getAllFunctions().forEach(fn => {
        const cfnFunction = fn.node.defaultChild;
        fn.addEnvironment("NEW_RELIC_LAMBDA_HANDLER", cfnFunction.handler);
        cfnFunction.handler = "app.lambdaHandler";
      });
    }

    // Show the endpoint in the output
    this.addOutputs({
      "ApiEndpoint": api.url,
    });
  }
}
