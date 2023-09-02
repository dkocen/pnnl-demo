// lib/my-eks-blueprints-pipeline-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';

export default class PipelineConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps){
    super(scope, id)

    const account = props?.env?.account!;
    const region = props?.env?.region!;

    const blueprint = blueprints.EksBlueprint.builder()
    .account(account)
    .region(region)
    .addOns(
        new blueprints.AwsLoadBalancerControllerAddOn,
        new blueprints.ExternalDnsAddOn({
            hostedZoneResources: [
                'test.davidkocen.com'
            ]
        }),
        new blueprints.NginxAddOn,
        new blueprints.CalicoOperatorAddOn,
        new blueprints.MetricsServerAddOn,
        new blueprints.ClusterAutoScalerAddOn,
        new blueprints.ContainerInsightsAddOn
    )
  
    blueprints.CodePipelineStack.builder()
      .name("PNNL-Demo-EKS-Pipeline")
      .repository({
          owner: 'dkocen',
          repoUrl: 'pnnl-demo',
          credentialsSecretName: 'github-token',
          targetRevision: 'main',
      })
      .wave({
        id: "envs",
        stages: [
          { id: "dev", stackBuilder: blueprint.clone('us-west-2')},
          { id: "test", stackBuilder: blueprint.clone('us-east-2')},
          { id: "prod", stackBuilder: blueprint.clone('us-east-1')}
        ]
      })
  }
}
