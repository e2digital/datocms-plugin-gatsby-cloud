import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ExtensionUI } from '@gatsby-cloud-pkg/gatsby-cms-extension-base';

import connectToDatoCms from './connectToDatoCms';
import './style.sass';

@connectToDatoCms(plugin => ({
  developmentMode: plugin.parameters.global.developmentMode,
  fieldValue: plugin.getFieldValue(plugin.fieldPath),
  plugin,
}))
export default class Main extends Component {
  static propTypes = {
    plugin: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      contentSlug: '',
      initalValue: '',
      slugField: '',
    };
    this.slugChange = this.slugChange.bind(this);
  }

  componentDidMount() {
    const { plugin } = this.props;
    const slugField = plugin.itemType.relationships.fields.data
      .map(link => plugin.fields[link.id])
      .find(field => field.attributes.field_type === 'slug');
    if (slugField) {
      const fieldPath = slugField.attributes.api_key;

      console.log(
        plugin,
        plugin.locale,
        plugin.parameters.global,
        slugField,
        plugin.getFieldValue(fieldPath),
      );
      this.setState({
        slugField,
        initalValue: plugin.getFieldValue(fieldPath),
      });
      this.unsubscribe = plugin.addFieldChangeListener(
        fieldPath,
        this.slugChange,
      );
    }
  }

  componentWillUnmount() {
    const { slugField } = this.state;
    if (slugField) {
      this.unsubscribe();
    }
  }

  slugChange(newValue) {
    this.setState({
      contentSlug: newValue,
    });
  }

  render() {
    const { plugin } = this.props;
    const {
      parameters: {
        global: { instanceUrl, authToken, multiLang },
      },
    } = plugin;

    const multiLangConfig = JSON.parse(plugin.parameters.global.languageConfig);

    const { initalValue, contentSlug } = this.state;

    console.log(
      `plugin.locale: ${plugin.locale}`,
      `multiLang: ${multiLang}`,
      `contentSlug: ${contentSlug}`,
    );
    return (
      <div className="container">
        <h1>Gatsby Cloud</h1>

        <ExtensionUI
          contentSlug={
            contentSlug[plugin.locale] || initalValue[plugin.locale] || ''
          }
          previewUrl={
            multiLang ? multiLangConfig[plugin.locale].instanceUrl : instanceUrl
          }
          authToken={
            multiLang ? multiLangConfig[plugin.locale].authToken : authToken
          }
        />
      </div>
    );
  }
}
