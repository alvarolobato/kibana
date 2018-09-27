/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { InfraMetricInput, InfraMetricType, InfraPathType } from '../../../common/graphql/types';
import { InfraNodeType } from '../../../server/lib/adapters/nodes';
import { State, waffleOptionsActions, waffleOptionsSelectors } from '../../store';
import { changeGroupBy, changeNodeType } from '../../store/local/waffle_options/actions';
import { initialWaffleOptionsState } from '../../store/local/waffle_options/reducer';
import { asChildFunctionRenderer } from '../../utils/typed_react';
import { bindPlainActionCreators } from '../../utils/typed_redux';
import { UrlStateContainer } from '../../utils/url_state';

const selectOptionsUrlState = createSelector(
  waffleOptionsSelectors.selectMetrics,
  waffleOptionsSelectors.selectGroupBy,
  waffleOptionsSelectors.selectNodeType,
  (metrics, groupBy, nodeType) => ({
    metrics,
    groupBy,
    nodeType,
  })
);

export const withWaffleOptions = connect(
  (state: State) => ({
    metrics: waffleOptionsSelectors.selectMetrics(state),
    groupBy: waffleOptionsSelectors.selectGroupBy(state),
    nodeType: waffleOptionsSelectors.selectNodeType(state),
    urlState: selectOptionsUrlState(state),
  }),
  bindPlainActionCreators({
    changeMetrics: waffleOptionsActions.changeMetrics,
    changeGroupBy: waffleOptionsActions.changeGroupBy,
    changeNodeType: waffleOptionsActions.changeNodeType,
  })
);

export const WithWaffleOptions = asChildFunctionRenderer(withWaffleOptions);

/**
 * Url State
 */

interface WaffleOptionsUrlState {
  metrics?: ReturnType<typeof waffleOptionsSelectors.selectMetrics>;
  groupBy?: ReturnType<typeof waffleOptionsSelectors.selectGroupBy>;
  nodeType?: ReturnType<typeof waffleOptionsSelectors.selectNodeType>;
}

export const WithWaffleMetricsUrlState = () => (
  <WithWaffleOptions>
    {({ changeMetrics, urlState }) => (
      <UrlStateContainer
        urlState={urlState}
        urlStateKey="waffleOptions"
        mapToUrlState={mapToUrlState}
        onChange={newUrlState => {
          if (newUrlState && newUrlState.metrics) {
            changeMetrics(newUrlState.metrics);
          }
          if (newUrlState && newUrlState.groupBy) {
            changeGroupBy(newUrlState.groupBy);
          }
          if (newUrlState && newUrlState.nodeType) {
            changeNodeType(newUrlState.nodeType);
          }
        }}
        onInitialize={initialUrlState => {
          if (initialUrlState) {
            changeMetrics(initialUrlState.metrics || initialWaffleOptionsState.metrics);
            changeGroupBy(initialUrlState.groupBy || initialWaffleOptionsState.groupBy);
            changeNodeType(initialUrlState.nodeType || initialWaffleOptionsState.nodeType);
          }
        }}
      />
    )}
  </WithWaffleOptions>
);

const mapToUrlState = (value: any): WaffleOptionsUrlState | undefined =>
  value
    ? {
        metrics: mapToMetricsUrlState(value.metrics),
        groupBy: mapToGroupByUrlState(value.groupBy),
        nodeType: mapToNodeTypeUrlState(value.nodeType),
      }
    : undefined;

const isInfraMetricInput = (subject: any): subject is InfraMetricInput => {
  return subject != null && subject.type != null && InfraMetricType[subject.type] != null;
};

const isInfraPathInput = (subject: any): subject is InfraPathType => {
  return subject != null && subject.type != null && InfraPathType[subject.type] != null;
};

const mapToMetricsUrlState = (subject: any) => {
  return subject && Array.isArray(subject) && subject.every(isInfraMetricInput)
    ? subject
    : undefined;
};

const mapToGroupByUrlState = (subject: any) => {
  return subject && Array.isArray(subject) && subject.every(isInfraPathInput) ? subject : undefined;
};

const mapToNodeTypeUrlState = (subject: any) => {
  return subject && InfraNodeType[subject] ? subject : undefined;
};
