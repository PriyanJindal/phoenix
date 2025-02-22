import React from "react";
import { createRoutesFromElements, Route, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";

import { datasetLoaderQuery$data } from "./pages/dataset/__generated__/datasetLoaderQuery.graphql";
import { embeddingLoaderQuery$data } from "./pages/embedding/__generated__/embeddingLoaderQuery.graphql";
import { Layout } from "./pages/Layout";
import { spanPlaygroundPageLoaderQuery$data } from "./pages/playground/__generated__/spanPlaygroundPageLoaderQuery.graphql";
import { projectLoaderQuery$data } from "./pages/project/__generated__/projectLoaderQuery.graphql";
import { promptLoaderQuery$data } from "./pages/prompt/__generated__/promptLoaderQuery.graphql";
import { promptConfigLoader } from "./pages/prompt/promptConfigLoader";
import { PromptIndexPage } from "./pages/prompt/PromptIndexPage";
import { PromptLayout } from "./pages/prompt/PromptLayout";
import { promptPlaygroundLoader } from "./pages/prompt/promptPlaygroundLoader";
import { PromptPlaygroundPage } from "./pages/prompt/PromptPlaygroundPage";
import { PromptVersionDetailsPage } from "./pages/prompt/PromptVersionDetailsPage";
import { promptVersionLoader } from "./pages/prompt/promptVersionLoader";
import { promptVersionsLoader } from "./pages/prompt/promptVersionsLoader";
import { PromptVersionsPage } from "./pages/prompt/PromptVersionsPage";
import { sessionLoader } from "./pages/trace/sessionLoader";
import { SessionPage } from "./pages/trace/SessionPage";
import {
  APIsPage,
  AuthenticatedRoot,
  authenticatedRootLoader,
  datasetLoader,
  DatasetPage,
  DatasetsPage,
  dimensionLoader,
  DimensionPage,
  embeddingLoader,
  EmbeddingPage,
  ErrorElement,
  ExamplePage,
  examplesLoader,
  ExamplesPage,
  experimentCompareLoader,
  ExperimentComparePage,
  experimentsLoader,
  ExperimentsPage,
  ForgotPasswordPage,
  homeLoader,
  LoginPage,
  ModelPage,
  ModelRoot,
  PlaygroundPage,
  ProfilePage,
  projectLoader,
  ProjectPage,
  ProjectsPage,
  ProjectsRoot,
  PromptConfigPage,
  promptLoader,
  promptsLoader,
  PromptsPage,
  resetPasswordLoader,
  ResetPasswordPage,
  ResetPasswordWithTokenPage,
  SettingsPage,
  settingsPageLoader,
  SpanPlaygroundPage,
  spanPlaygroundPageLoader,
  SupportPage,
  TracePage,
  TracingRoot,
} from "./pages";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<ErrorElement />}>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
        loader={resetPasswordLoader}
      />
      <Route
        path="/reset-password-with-token"
        element={<ResetPasswordWithTokenPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<AuthenticatedRoot />} loader={authenticatedRootLoader}>
        <Route element={<Layout />}>
          <Route
            path="/profile"
            handle={{ crumb: () => "profile" }}
            element={<ProfilePage />}
          />
          <Route index loader={homeLoader} />
          <Route
            path="/model"
            handle={{ crumb: () => "model" }}
            element={<ModelRoot />}
          >
            <Route index element={<ModelPage />} />
            <Route element={<ModelPage />}>
              <Route path="dimensions">
                <Route
                  path=":dimensionId"
                  element={<DimensionPage />}
                  loader={dimensionLoader}
                />
              </Route>
            </Route>
            <Route path="embeddings">
              <Route
                path=":embeddingDimensionId"
                element={<EmbeddingPage />}
                loader={embeddingLoader}
                handle={{
                  // `crumb` is your own abstraction, we decided
                  // to make this one a function so we can pass
                  // the data from the loader to it so that our
                  // breadcrumb is made up of dynamic content
                  crumb: (data: embeddingLoaderQuery$data) =>
                    data.embedding.name,
                }}
              />
            </Route>
          </Route>
          <Route
            path="/projects"
            handle={{ crumb: () => "projects" }}
            element={<ProjectsRoot />}
          >
            <Route index element={<ProjectsPage />} />
            <Route
              path=":projectId"
              element={<TracingRoot />}
              loader={projectLoader}
              handle={{
                crumb: (data: projectLoaderQuery$data) => data.project.name,
              }}
            >
              <Route index element={<ProjectPage />} />
              <Route element={<ProjectPage />}>
                <Route path="traces/:traceId" element={<TracePage />} />
                <Route
                  path="sessions/:sessionId"
                  element={<SessionPage />}
                  loader={sessionLoader}
                />
              </Route>
            </Route>
          </Route>
          <Route path="/datasets" handle={{ crumb: () => "datasets" }}>
            <Route index element={<DatasetsPage />} />
            <Route
              path=":datasetId"
              loader={datasetLoader}
              handle={{
                crumb: (data: datasetLoaderQuery$data) => data.dataset.name,
              }}
            >
              <Route element={<DatasetPage />} loader={datasetLoader}>
                <Route
                  index
                  element={<ExperimentsPage />}
                  loader={experimentsLoader}
                />
                <Route
                  path="experiments"
                  element={<ExperimentsPage />}
                  loader={experimentsLoader}
                />
                <Route
                  path="examples"
                  element={<ExamplesPage />}
                  loader={examplesLoader}
                >
                  <Route path=":exampleId" element={<ExamplePage />} />
                </Route>
              </Route>
              <Route
                path="compare"
                handle={{
                  crumb: () => "compare",
                }}
                loader={experimentCompareLoader}
                element={<ExperimentComparePage />}
              />
            </Route>
          </Route>
          <Route
            path="/playground"
            handle={{
              crumb: () => "Playground",
            }}
          >
            <Route index element={<PlaygroundPage />} />
            <Route
              path="spans/:spanId"
              element={<SpanPlaygroundPage />}
              loader={spanPlaygroundPageLoader}
              handle={{
                crumb: (data: spanPlaygroundPageLoaderQuery$data) => {
                  if (data.span.__typename === "Span") {
                    return `span ${data.span.context.spanId}`;
                  }
                  return "span unknown";
                },
              }}
            />
          </Route>
          <Route
            path="/prompts"
            handle={{
              crumb: () => "prompts",
            }}
          >
            <Route index element={<PromptsPage />} loader={promptsLoader} />
            <Route
              path=":promptId"
              loader={promptLoader}
              // force this route to always revalidate, preventing stale versions from being
              // displayed when navigating back to the prompt page after gql mutation
              shouldRevalidate={() => true}
              handle={{
                crumb: (data: promptLoaderQuery$data) => {
                  if (data.prompt.__typename === "Prompt") {
                    return data.prompt.name;
                  }
                  return "unknown";
                },
              }}
            >
              <Route element={<PromptLayout />}>
                <Route index element={<PromptIndexPage />} />
                <Route
                  path="versions"
                  loader={promptVersionsLoader}
                  element={<PromptVersionsPage />}
                >
                  <Route
                    path=":versionId"
                    loader={promptVersionLoader}
                    element={<PromptVersionDetailsPage />}
                  />
                </Route>
                <Route
                  path="config"
                  element={<PromptConfigPage />}
                  loader={promptConfigLoader}
                />
              </Route>
              <Route
                path="playground"
                element={<PromptPlaygroundPage />}
                loader={promptPlaygroundLoader}
                handle={{
                  crumb: () => "playground",
                }}
              />
            </Route>
          </Route>
          <Route
            path="/apis"
            element={<APIsPage />}
            handle={{
              crumb: () => "APIs",
            }}
          />
          <Route
            path="/support"
            element={<SupportPage />}
            handle={{
              crumb: () => "support",
            }}
          />
          <Route
            path="/settings"
            element={<SettingsPage />}
            loader={settingsPageLoader}
            handle={{
              crumb: () => "settings",
            }}
          />
        </Route>
      </Route>
    </Route>
  ),
  {
    basename: window.Config.basename,
  }
);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
