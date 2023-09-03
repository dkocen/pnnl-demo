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
    .resourceProvider("HostedZone",  new blueprints.ImportHostedZoneProvider("Z02135133RB93ETC313CB"))
    .addOns(
        new blueprints.AwsLoadBalancerControllerAddOn(),
        new blueprints.ExternalDnsAddOn({
            hostedZoneResources: [
                'HostedZone'
            ]
        }),
        new blueprints.NginxAddOn(),
        new blueprints.CalicoOperatorAddOn(),
        new blueprints.MetricsServerAddOn(),
        new blueprints.ClusterAutoScalerAddOn(),
        new blueprints.ContainerInsightsAddOn(),
        new blueprints.addons.ArgoCDAddOn()
    )
  
    blueprints.CodePipelineStack.builder()
      .name("PNNL-Demo-EKS-Pipeline")
      .codeBuildPolicies(blueprints.DEFAULT_BUILD_POLICIES)
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
          { id: "prod", stackBuilder: blueprint.clone('us-west-1')}
        ]
      })
      .build(scope, "PipelineStack", {
        env: props?.env
      });
  }
}
