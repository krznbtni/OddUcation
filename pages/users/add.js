import React, { Component } from "react";
import { Container, Button, Card, Form, Grid, Input, Message, Icon } from 'semantic-ui-react';
import Layout from "../../components/general/Layout";
import factory from '../../ethereum/factory'; // import factory instance
import web3 from '../../ethereum/web3';
import { Link, Router } from '../../routes';

class AddUser extends Component {

  state = {
    errorMessage: '',
    loading: false,
    userAddress: '',
    balance: '0',
    name: '',
    role: '',
    organizationMembersCount: '0',
    posts: [],
    userPostsCount: '0',
    socialMedia1: '',
    socialMedia2: '',
    socialMedia3: '',
    addressToAdd: ''
  }

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);
      const profileSummary = await factory.methods.getProfile(accounts[0]).call();
      const userPostsCount = await factory.methods.userPostsCount(accounts[0]).call();

      this.setState({ userAddress: accounts[0] });
      this.setState({ balance: balance });

      if (profileSummary[0] === '1') {
        this.setState({ role: 'Regular'});
      } else if (profileSummary[0] === '2') {
        this.setState({ role: 'Organization' });
        this.setState({ organizationMembersCount: profileSummary[4].length });
      }

      this.setState({ name: web3.utils.hexToUtf8(profileSummary[1]) });
      this.setState({ socialMedia1: web3.utils.hexToUtf8(profileSummary[2][0]) });
      this.setState({ socialMedia2: web3.utils.hexToUtf8(profileSummary[2][1]) });
      this.setState({ socialMedia3: web3.utils.hexToUtf8(profileSummary[2][2]) });
      this.setState({ posts: profileSummary[3] });
      this.setState({ userPostsCount: userPostsCount });
    } catch (err) {
      console.log(err)
    }
  };

  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      await factory.methods.addMember(this.state.addressToAdd).send({ from: accounts[0] });
      
      Router.pushRoute(`/users/${this.state.userAddress}`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  onDeleteAccount = async (event) => {
    this.setState({ loading: true, errorMessage: '' });
    event.preventDefault();

    try {
      const accounts = await web3.eth.getAccounts();
      let g = await factory.methods.deleteAccount().send({ from: accounts[0] });

      Router.pushRoute('/');
    } catch (err) {
      console.log('err: ', err);
    }

    this.setState({ loading: false });
  }

  renderEssentials() {
    const { Content, Header, Meta, Description } = Card;

    return (
      <Card fluid>
        <Content>
          <Header>{this.state.name} ({this.state.role})</Header>
          <Meta>{this.state.organizationMembersCount} members</Meta>
          <Meta>{this.state.userPostsCount} posts</Meta>
          <Description>Balance: {web3.utils.fromWei(this.state.balance, 'ether')} (ETH)</Description>
          <Content extra>{this.state.socialMedia1}</Content>
          <Content extra>{this.state.socialMedia2}</Content>
          <Content extra>{this.state.socialMedia3}</Content>
        </Content>
      </Card>
    );
  }

  render() {
    const { Input } = Form;

    return (
      <Layout>
        <Container>
          <h3>AddUser</h3>

          <Grid>
            <Grid.Row>
              <Grid.Column width={4}>
                {this.renderEssentials()}

                <Link route={`/users/${this.state.userAddress}/update-profile`}>
                  <a className="item">
                    <Button fluid content="Update Profile" icon="setting" primary />
                  </a>
                </Link>

                <Link route="/posts/new">
                  <a className="item">
                    <Button fluid content="Create Post" icon="compose" primary style={{ marginTop: '10px' }} />
                  </a>
                </Link>

                <Link route={`/users/${this.state.userAddress}/add-user`}>
                  <a className="item">
                    <Button fluid content="Add User" icon="add user" primary style={{ marginTop: '10px' }} />
                  </a>
                </Link>

                <Link route={`/users/${this.state.userAddress}/show-users`}>
                  <a className="item">
                    <Button fluid content="Show Users" icon="group" primary style={{ marginTop: '10px' }} />
                  </a>
                </Link>

                <Button fluid onClick={event => this.onDeleteAccount(event)} loading={this.state.loading}
                content="Delete Account" icon="user delete" negative style={{ marginTop: '10px' }} />
                
              </Grid.Column>

              <Grid.Column width={12}>

                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                  <Input label="User Address" value={this.state.addressToAdd}
                    onChange={event => this.setState({ addressToAdd: event.target.value })}
                  />

                  <Message error header="Oops!" content={this.state.errorMessage} />
                  <Button loading={this.state.loading} primary>Add</Button>
                </Form>

              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </Layout>
    );
  };

}

export default AddUser;