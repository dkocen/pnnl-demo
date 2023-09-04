// lib/my-eks-blueprints-pipeline-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { ArnPrincipal } from 'aws-cdk-lib/aws-iam';

export default class PipelineConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps){
    super(scope, id)

    const account = props?.env?.account!;
    const region = props?.env?.region!;

    const buildPolicy = new PolicyStatement({
      resources: ['*'],
      actions: ['*'],
      effect: Effect.ALLOW
    })

    const blueprint = blueprints.EksBlueprint.builder()
    .account(account)
    .region(region)
    .version('auto')
    .addOns(
        new blueprints.addons.AwsLoadBalancerControllerAddOn(),
        new blueprints.addons.NginxAddOn(),
        new blueprints.addons.CalicoOperatorAddOn(),
        new blueprints.addons.ClusterAutoScalerAddOn(),
        new blueprints.addons.VpcCniAddOn(),
        new blueprints.addons.CoreDnsAddOn(),
        new blueprints.addons.KubeProxyAddOn(),
        new blueprints.addons.ArgoCDAddOn()
    )
    .teams(new blueprints.PlatformTeam({
      name: 'admin-team',
      users: [
        new ArnPrincipal('arn:aws:iam::274344030317:user/dkocen')
      ] 
    }))
  
    blueprints.CodePipelineStack.builder()
      .name("PNNL-Demo-EKS-Pipeline")
      .codeBuildPolicies([
        buildPolicy
      ])
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
