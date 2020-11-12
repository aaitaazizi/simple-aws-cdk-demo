import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as lb from '@aws-cdk/aws-elasticloadbalancingv2';
import { getUserData } from './userData';

export class SimpleCDKdemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Default VPC
    const vpc = ec2.Vpc.fromLookup(this, 'defaultvpc', {isDefault: true})

    // Security Group
    const sg = new ec2.SecurityGroup(this, 'sg', {
      vpc,
      securityGroupName: 'sgdemo',
      description: 'sg created for demo',
      allowAllOutbound: true
    })

    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow everyone access')
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow SSH access')
    sg.addIngressRule(sg, ec2.Port.tcp(80), 'allow ALB access')
    
    // User Data Script
    const userData = ec2.UserData.custom(getUserData())

    // IAM ROLE
    const role = new iam.Role(this, 'role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'instance role',
      roleName: 'instance-role-html-page'
    })

    role.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      effect: iam.Effect.ALLOW,
      actions: ['dynamo:*',
                'cloudwatch:*']
      }))

    // EC2 Instance
    const instance = new ec2.Instance(this, 'instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      machineImage: new ec2.AmazonLinuxImage,
      securityGroup: sg,
      role: role,
      instanceName: 'demo-instance',
      userData: userData
    })

    // Add EC2 Tags 
    cdk.Tag.add(instance, 'app', 'demo')
    cdk.Tag.add(instance, 'conf', 'AllDayDevOps')

    // Application LB
    const alb = new lb.ApplicationLoadBalancer(this, 'alb', {
      vpc,
      internetFacing: true,
      loadBalancerName: 'demo-lb',
      securityGroup: sg
    })

    // ALB Listener & Targets
    const lblistener = alb.addListener('albListener', {
      protocol: lb.ApplicationProtocol.HTTP,
      port: 80
    }) 

    lblistener.addTargets('albListenerTarget', {
      port: 80,
      targets: [new lb.InstanceTarget(instance.instanceId)],
      protocol: lb.ApplicationProtocol.HTTP
    })

    // ALB URL as Output
    new cdk.CfnOutput(this, 'alb URL', {value: alb.loadBalancerDnsName})
  }
}
