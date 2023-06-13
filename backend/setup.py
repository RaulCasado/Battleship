from setuptools import setup, find_packages

setup(
    name='my-package',
    version='1.0.0',
    description='My Python package',
    packages=find_packages(),
    install_requires=[
        'python-socketio==5.8.0',
        'eventlet==0.33.3',
    ],
)
