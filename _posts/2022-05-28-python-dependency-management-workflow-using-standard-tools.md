---
layout: post
title:  "Python dependency management workflow using standard tools"
date:   2022-05-28 12:23:56 0200
categories: software-engineering
---

<figure>
<img
src="{{'assets/2022-06-10-python-dependencies-management-workflow-using-standard-tools/artturi-jalli-g5_rxRjvKmg-unsplash.jpg'| relative_url}}"
style="width: 100%; height: 600px; object-fit: cover;"
/>

<figcaption style="text-align: center">Foto of <a href="https://unsplash.com/@artturijalli"  target="_blank">Artturi Jalli</a> on <a href="https://unsplash.com/"  target="_blank">Unsplash</a></figcaption>
</figure>

In recent years, things have evolved in the python community; new tools have tried to become the new standard for python when it comes to dependency management and in some cases, also packaging. Noticeable examples are:

- [poetry](https://python-poetry.org)
- [pipenv](https://pipenv.pypa.io/en/latest/)
- [pip-tools](https://github.com/jazzband/pip-tools)

Parallelly, but less noticeably, some Python Enhancement Proposals (aka PEPs) have started to *officialize* the usage of the `pyproject.toml` file and to standardize the fields of this document for specifying dependencies and build backends (PEP [517](https://peps.python.org/pep-0517/), [518](https://peps.python.org/pep-0518/), [631](https://peps.python.org/pep-0631/) and many others).

In recent months I have started to think about what could be the *ultimate workflow* for python dependency management and what I realized is that **there is no one-size-fits-all** solution to this problem. Unlike other programming languages (like javascript with npm for example), in python there is not a standard and correct way for solving this problem, but instead, there are a bunch of different tools that fit a specific workflow.

In this article I would like to propose a possible workflow for python dependency management. The goal of the workflow I propose in this article is to rely on standard tools (like pip) as much as possible and to follow the latest python trends and recommendations.

## Dependencies specification

A module might depend on other modules for several reasons. Some modules are used only during testing, others during building and others at runtime. For the sake of simplicity, in this article I will classify dependencies into two buckets: **development** and **runtime** dependencies. I am quite confident that this simplification will capture the vast majority of use cases.

**Runtime** dependencies are dependencies that are necessary to run your code, like the libraries that are imported. For example, if in my code I write `import pandas as pd`, pandas automatically becomes a runtime dependencies of the module that I am writing.

**Development** dependencies are dependencies that are needed to develop the module but they are not actually used when the module runs. For example, `pytest` is a popular python library for running unit tests.

Following PEP [631](https://peps.python.org/pep-0631/), I propose to specify dependencies in the `pyproject.toml` file. Moreover, I propose to specify **runtime** and **development** dependencies as follows:

```toml
...

[project]
# Runtime dependencies
dependencies = [
    'pandas >= 1.4',
]

[project.optional-dependencies]
# Development Dependencies
dev = [
    'pytest >= 1.2',
]

...
```

> The example here is not complete, a full working example of `pyproject.toml` can be found [below](#minimal-pyprojecttoml-configurations).

In this way, using a recent version of pip (>=22.0), it is possible to install the module I am working on and its dependencies by running the commands:

```bash
# To install runtime dependencies only
pip install .

# To install runtime dependencies and development dependencies
pip install -e .[dev]
```

Dependencies can be specified loosely (with `>=`, `~=`) or strictly (with `==` or even using hashes). In the `pyproject.toml` both development dependencies and runtime dependencies should be specified as loosely as possible. This allows your package to be more compatible with a wider range of environments when you distribute it.

Since you also want your code to be reproducible, on top of loosely specifying your dependencies in the `pyproject.toml`, they should also be **strictly** specified in a `requirements.txt` file. Those 2 files should always be kept in sync and version controlled (you should commit them with git).

In order to sync the `requirements.txt` with the `pyproject.toml` you should run the command:

```bash
pip freeze --exclude-editable > requirements.txt
```

> The `--exclude-editable` option will prevent the module you are working on to end up in the `requirements.txt`. Without this option, the local absolute path of your module will end up there, making the `requirements.txt` not usable for other developers.

Every time you edit the `pyproject.toml` and update your environment.

The `pyproject.toml` is *for humans*, the `requirements.txt` is *for robots*. What I mean by that is that the `pyproject.toml` should be easily readable and it should be manually edited by developers (which are humans, I know, hard to believe, right?), while the `requirements.txt` file should not be manually edited and should be edited by pip (the robot :) ).

If you are familiar with the workflows of [poetry](https://python-poetry.org), [pipenv](https://pipenv.pypa.io/en/latest/) or [pip-tools](https://github.com/jazzband/pip-tools), what I propose here is to use the `pyproject.toml` as the place to put your high level requirements, like the `pyproject.toml` for poetry or the `Pipfile` for Pipenv and the `requirements.in` for pip-tools and the `requirements.txt` as the *lock* file (as it is done in pip-tools).

For python business applications (so not packages to distribute), you might opt for two requirements files. A `requirements.txt` where you strictly define your runtime requirements and a `requirements_dev.txt` where you define your runtime + development requirements. In this way you have a reproducible *production* environment with only the required libraries and a reproducible development environment with all the rest.

## Full workflow

### Prerequisites

1. Latest version of pip (>=22.1), upgrade with the command

    ```bash
    pip install --upgrade pip
    ```

2. Optional, [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and the repository should be version controlled with git. Start doing so by running

    ```bash
    git init
    ```

### Minimal `pyproject.toml` configurations

```toml
[project]
name = "<Your project name here>"
description = "<Project description Here>"
version = "0.1.0"
authors = [
    { name = "Author Name", email = "author@email.com" }
]

# Here you define your runtime dependencies
dependencies = [
    "pandas",
]

[project.optional-dependencies]
# Here you define your development dependencies
dev = [
    "pytest",
]

[build-system]
build-backend = "flit_core.buildapi"
requires = ["flit_core >=3.2,<4"]
```

> Here [flit](https://flit.pypa.io/en/latest/index.html) is used instead of [setuptools](https://setuptools.pypa.io/en/latest/) as a build backend so that we do not need to create a `setup.py` file in our repository.

### Project initialization

1. A set of initial runtime and development dependencies are loosely defined in the `pyproject.toml`. You can start from the [minimal configurations](#minimal-pyprojecttoml-configurations) defined above.
2. A virtual environment for this project is created and activated by running the commands

   ```bash
   # Install virtualenv
   pip install --upgrade virtualenv

   # Create a new virtual environment into a new folder named venv
   python -m venv venv

   # Activate virtual environment
   # On Linux/Mac
   source ./venv/bin/activate
   # On Windows/Powershell
   .\venv\Scripts\activate
   ```

3. The project and its initial dependencies are installed in the environment by running the command

    ```bash
    pip install -e '.[dev]'
    ```

4. The installed requirements are fixed into a `requirements.txt` file by running the command

    ```bash
    pip freeze --exclude-editable > requirements.txt
    ```

5. (Optional, recommended if the project is version controlled with `git`) The venv folder is added to the `.gitignore` file and the `requirements.txt` and the `pyproject.toml` are added to version control.

    ```bash
    echo venv* >> .gitignore
    git add requirements.txt pyproject.toml .gitignore
    git commit -m "Update environment"
    ```

### New environment creation

1. A virtual environment for this project is created and activated by running the commands

   ```bash
   # Install virtualenv
   pip install --upgrade virtualenv

   # Create a new virtual environment into a new folder named venv
   python -m venv venv

   # Activate virtual environment
   # On Linux/Mac
   source ./venv/bin/activate
   # On Windows/Powershell
   .\venv\Scripts\activate
   ```

2. The project and its dependencies are installed in the environment by running the commands

    ```bash
    # Install project dependencies
    pip install -r requirements.txt

    # Install project in editable mode
    # without resolving dependencies
    pip install -e . --no-deps
    ```

> In the command above, the `--no-deps` is added so that pip will keep the dependencies versions as defined in the previous step. Omitting this option might update the version of some dependencies.

### Update dependencies

1. The dependencies are manually updated in the `pyproject.toml` file.
2. The virtual environment for this project is activated by running the command

   ```bash
   # On Linux/Mac
   source ./venv/bin/activate
   # On Windows/Powershell
   .\venv\Scripts\activate
   ```

3. The project and its dependencies are updated by running the command

    ```bash
    pip install -e '.[dev]'
    ```

4. The updated requirements are fixed into a `requirements.txt` file by running the command

    ```bash
    pip freeze --exclude-editable > requirements.txt
    ```

5. (Optional, recommended if the project is version controlled with `git`) The `requirements.txt` and the `pyproject.toml` are added to version control.

    ```bash
    git add requirements.txt pyproject.toml
    git commit -m "Update environment"
    ```

### Example `Makefile` for automating steps above

```makefile
env-create:
	pip install --upgrade pip
	if ! test -d venv; \
	then \
		echo creating virtual environment; \
		pip install --upgrade virtualenv; \
		python -m venv venv; \
	fi

env-install:
	pip install --upgrade pip
	if test -s requirements.txt; \
	then \
		echo Installing requirements from requirements.txt; \
		pip install -r requirements.txt ; \
		pip install -e . --no-deps ; \
	else \
		echo Installing requirements from pyproject.toml; \
		pip install -e '.[dev]'; \
		pip freeze --exclude-editable > requirements.txt; \
	fi

env-update:
	pip install -e '.[dev]'
	pip freeze --exclude-editable > requirements.txt
```

By creating a file named `Makefile` with the content above, some of the steps can be automated and the full workflow becomes:

```bash
# Create new virtualenv
make env-create

# Always activate your virtualenv before executing
# the commands below
# On Linux/Mac
source ./venv/bin/activate
# On Windows/Powershell
.\venv\Scripts\activate

# Install dependencies
make env-install

# Update environment after changing pyproject.toml
make env-update
```
